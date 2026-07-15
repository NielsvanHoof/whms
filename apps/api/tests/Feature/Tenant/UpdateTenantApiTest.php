<?php

declare(strict_types=1);

use App\Models\Tenant;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\InteractsWithRbac;

uses(InteractsWithRbac::class);

beforeEach(fn () => $this->seedRbac());

it('requires authentication to update tenant', function () {
    $this->patchJson('/api/v1/tenant', [
        'name' => 'Renamed',
    ])->assertUnauthorized();
});

it('allows manager to update tenant name', function () {
    $tenant = Tenant::factory()->create(['name' => 'Before', 'slug' => 'before']);
    $manager = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($manager, 'manager');
    $tenant->makeCurrent();

    Sanctum::actingAs($manager);

    $this->patchJson('/api/v1/tenant', [
        'name' => 'After',
    ])->assertSuccessful()
        ->assertJsonPath('data.name', 'After')
        ->assertJsonPath('data.slug', 'before');

    $this->assertDatabaseHas('tenants', [
        'id' => $tenant->id,
        'name' => 'After',
    ]);
});

it('prevents viewer from updating tenant', function () {
    $tenant = Tenant::factory()->create();
    $viewer = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($viewer, 'viewer');
    $tenant->makeCurrent();

    Sanctum::actingAs($viewer);

    $this->patchJson('/api/v1/tenant', [
        'name' => 'Blocked',
    ])->assertForbidden();
});

it('prevents manager from using duplicate slug', function () {
    $tenantA = Tenant::factory()->create(['slug' => 'taken']);
    $tenantB = Tenant::factory()->create(['slug' => 'mine']);
    $manager = User::factory()->create(['tenant_id' => $tenantB->id]);
    $this->assignRole($manager, 'manager');
    $tenantB->makeCurrent();

    Sanctum::actingAs($manager);

    $this->patchJson('/api/v1/tenant', [
        'slug' => 'taken',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['slug']);
});
