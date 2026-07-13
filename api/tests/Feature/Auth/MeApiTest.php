<?php

declare(strict_types=1);

use App\Models\Tenant;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\InteractsWithRbac;

uses(InteractsWithRbac::class);

beforeEach(fn () => $this->seedRbac());

it('requires authentication for me endpoint', function () {
    $this->getJson('/api/v1/me')
        ->assertUnauthorized()
        ->assertHeader('content-type', 'application/json');
});

it('returns user roles and flattened permissions', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($user, 'manager');

    Sanctum::actingAs($user);

    $this->getJson('/api/v1/me')
        ->assertOk()
        ->assertJsonPath('data.user.id', $user->id)
        ->assertJsonPath('data.user.tenant_id', $tenant->id)
        ->assertJsonPath('data.user.email', $user->email)
        ->assertJsonPath('data.tenant.id', $tenant->id)
        ->assertJsonPath('data.tenant.name', $tenant->name)
        ->assertJsonPath('data.tenant.slug', $tenant->slug)
        ->assertJsonFragment(['manager'])
        ->assertJsonFragment(['warehouses.view'])
        ->assertJsonFragment(['products.manage'])
        ->assertJsonFragment(['inventory.view'])
        ->assertJsonFragment(['roles.manage']);
});
