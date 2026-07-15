<?php

declare(strict_types=1);

use App\Models\Tenant;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\InteractsWithRbac;

uses(InteractsWithRbac::class);

beforeEach(fn () => $this->seedRbac());

it('requires authentication to update profile', function () {
    $this->patchJson('/api/v1/account/profile', ['name' => 'Jane Doe'])
        ->assertUnauthorized()
        ->assertHeader('content-type', 'application/json');
});

it('updates display name on profile', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create([
        'tenant_id' => $tenant->id,
        'name' => 'Old Name',
    ]);
    $this->assignRole($user, 'manager');

    Sanctum::actingAs($user);

    $this->patchJson('/api/v1/account/profile', ['name' => 'Jane Doe'])
        ->assertOk()
        ->assertJsonPath('data.user.name', 'Jane Doe')
        ->assertJsonPath('data.user.email', $user->email)
        ->assertJsonPath('data.tenant.id', $tenant->id);

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'name' => 'Jane Doe',
        'email' => $user->email,
    ]);
});

it('requires name when updating profile', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['tenant_id' => $tenant->id]);

    Sanctum::actingAs($user);

    $this->patchJson('/api/v1/account/profile', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name']);
});

it('rejects email changes on profile update', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['tenant_id' => $tenant->id]);

    Sanctum::actingAs($user);

    $this->patchJson('/api/v1/account/profile', [
        'name' => 'Jane Doe',
        'email' => 'hacker@example.com',
    ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['email']);

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'email' => $user->email,
    ]);
});
