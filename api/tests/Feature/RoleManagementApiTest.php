<?php

declare(strict_types=1);

use App\Models\Tenant;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\InteractsWithRbac;

uses(InteractsWithRbac::class);

beforeEach(fn () => $this->seedRbac());

it('requires authentication for role management endpoints', function () {
    $this->getJson('/api/v1/access/roles')->assertUnauthorized();
    $this->getJson('/api/v1/access/permissions')->assertUnauthorized();
    $this->getJson('/api/v1/access/users')->assertUnauthorized();
});

it('allows manager to list roles permissions and tenant users', function () {
    $tenant = Tenant::factory()->create();
    $manager = User::factory()->create(['tenant_id' => $tenant->id]);
    $viewer = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($manager, 'manager');
    $this->assignRole($viewer, 'viewer');

    Sanctum::actingAs($manager);

    $this->getJson('/api/v1/access/roles')
        ->assertOk()
        ->assertJsonPath('data.0.name', 'manager');

    $this->getJson('/api/v1/access/permissions')
        ->assertOk()
        ->assertJsonFragment(['roles.manage']);

    $this->getJson('/api/v1/access/users')
        ->assertOk()
        ->assertJsonCount(2, 'data');
});

it('prevents viewer from accessing role management endpoints', function () {
    $tenant = Tenant::factory()->create();
    $viewer = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($viewer, 'viewer');

    Sanctum::actingAs($viewer);

    $this->getJson('/api/v1/access/roles')->assertForbidden();
    $this->getJson('/api/v1/access/permissions')->assertForbidden();
    $this->getJson('/api/v1/access/users')->assertForbidden();
});

it('allows manager to assign roles to user in same tenant', function () {
    $tenant = Tenant::factory()->create();
    $manager = User::factory()->create(['tenant_id' => $tenant->id]);
    $target = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($manager, 'manager');
    $this->assignRole($target, 'viewer');

    Sanctum::actingAs($manager);

    $this->putJson('/api/v1/access/users/'.$target->id.'/roles', [
        'roles' => ['operator'],
    ])->assertOk()
        ->assertJsonPath('data.roles.0', 'operator');
});

it('prevents manager from assigning roles to user in other tenant', function () {
    $tenantA = Tenant::factory()->create();
    $tenantB = Tenant::factory()->create();
    $manager = User::factory()->create(['tenant_id' => $tenantA->id]);
    $otherTenantUser = User::factory()->create(['tenant_id' => $tenantB->id]);
    $this->assignRole($manager, 'manager');
    $this->assignRole($otherTenantUser, 'viewer');

    Sanctum::actingAs($manager);

    $this->putJson('/api/v1/access/users/'.$otherTenantUser->id.'/roles', [
        'roles' => ['operator'],
    ])->assertNotFound();
});

it('prevents manager from assigning unknown role', function () {
    $tenant = Tenant::factory()->create();
    $manager = User::factory()->create(['tenant_id' => $tenant->id]);
    $target = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($manager, 'manager');

    Sanctum::actingAs($manager);

    $this->putJson('/api/v1/access/users/'.$target->id.'/roles', [
        'roles' => ['not-a-role'],
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['roles.0']);
});

it('allows manager to create user in same tenant', function () {
    $tenant = Tenant::factory()->create();
    $manager = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($manager, 'manager');
    $tenant->makeCurrent();

    Sanctum::actingAs($manager);

    $this->postJson('/api/v1/access/users', [
        'name' => 'New Operator',
        'email' => 'operator@example.com',
        'password' => 'password-1',
        'password_confirmation' => 'password-1',
        'roles' => ['operator'],
    ])->assertCreated()
        ->assertJsonPath('data.email', 'operator@example.com')
        ->assertJsonPath('data.roles.0', 'operator');

    $this->assertDatabaseHas('users', [
        'tenant_id' => $tenant->id,
        'email' => 'operator@example.com',
    ]);
});

it('prevents viewer from creating user', function () {
    $tenant = Tenant::factory()->create();
    $viewer = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($viewer, 'viewer');
    $tenant->makeCurrent();

    Sanctum::actingAs($viewer);

    $this->postJson('/api/v1/access/users', [
        'name' => 'Blocked',
        'email' => 'blocked@example.com',
        'password' => 'password-1',
        'password_confirmation' => 'password-1',
        'roles' => ['viewer'],
    ])->assertForbidden();
});

it('prevents manager from creating user with duplicate email', function () {
    $tenant = Tenant::factory()->create();
    $manager = User::factory()->create(['tenant_id' => $tenant->id]);
    User::factory()->create([
        'tenant_id' => $tenant->id,
        'email' => 'taken@example.com',
    ]);
    $this->assignRole($manager, 'manager');
    $tenant->makeCurrent();

    Sanctum::actingAs($manager);

    $this->postJson('/api/v1/access/users', [
        'name' => 'Duplicate',
        'email' => 'taken@example.com',
        'password' => 'password-1',
        'password_confirmation' => 'password-1',
        'roles' => ['viewer'],
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['email']);
});
