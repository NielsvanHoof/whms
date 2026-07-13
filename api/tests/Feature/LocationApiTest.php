<?php

declare(strict_types=1);

use App\Models\Location;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Warehouse;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\InteractsWithRbac;

uses(InteractsWithRbac::class);

beforeEach(fn () => $this->seedRbac());

it('requires authentication for locations', function () {
    $this->getJson('/api/v1/locations')
        ->assertUnauthorized()
        ->assertHeader('content-type', 'application/json');
});

it('allows authenticated user to list and create locations', function () {
    $tenant = Tenant::factory()->create();
    $warehouse = Warehouse::factory()->create(['tenant_id' => $tenant->id]);
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($user, 'manager');

    Sanctum::actingAs($user);

    $this->getJson('/api/v1/locations')
        ->assertOk()
        ->assertJsonPath('data', []);

    $create = $this->postJson('/api/v1/locations', [
        'warehouse_id' => $warehouse->id,
        'code' => 'BIN-A01',
        'type' => 'storage',
    ]);

    $create->assertCreated()
        ->assertJsonPath('data.warehouse_id', $warehouse->id)
        ->assertJsonPath('data.code', 'BIN-A01')
        ->assertJsonPath('data.type', 'storage');
});

it('requires valid tenant warehouse when storing location', function () {
    $tenantA = Tenant::factory()->create();
    $tenantB = Tenant::factory()->create();
    $warehouseB = Warehouse::factory()->create(['tenant_id' => $tenantB->id]);
    $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
    $this->assignRole($userA, 'manager');

    Sanctum::actingAs($userA);

    $this->postJson('/api/v1/locations', [
        'warehouse_id' => $warehouseB->id,
        'code' => 'BIN-X01',
        'type' => 'storage',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['warehouse_id']);
});

it('rejects duplicate location code within same warehouse', function () {
    $tenant = Tenant::factory()->create();
    $warehouse = Warehouse::factory()->create(['tenant_id' => $tenant->id]);
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($user, 'manager');

    Sanctum::actingAs($user);

    $this->postJson('/api/v1/locations', [
        'warehouse_id' => $warehouse->id,
        'code' => 'BIN-DUP',
        'type' => 'storage',
    ])->assertCreated();

    $this->postJson('/api/v1/locations', [
        'warehouse_id' => $warehouse->id,
        'code' => 'BIN-DUP',
        'type' => 'pick',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['code']);
});

it('prevents user from viewing location from another tenant', function () {
    $tenantA = Tenant::factory()->create();
    $tenantB = Tenant::factory()->create();
    $warehouseB = Warehouse::factory()->create(['tenant_id' => $tenantB->id]);
    $locationB = Location::withoutGlobalScopes()->create([
        'tenant_id' => $tenantB->id,
        'warehouse_id' => $warehouseB->id,
        'code' => 'BIN-OTHER',
        'type' => 'storage',
    ]);

    $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
    $this->assignRole($userA, 'manager');
    Sanctum::actingAs($userA);

    $this->getJson('/api/v1/locations/'.$locationB->id)
        ->assertNotFound();
});

it('allows user to update and delete own location', function () {
    $tenant = Tenant::factory()->create();
    $warehouse = Warehouse::factory()->create(['tenant_id' => $tenant->id]);
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($user, 'manager');

    Sanctum::actingAs($user);

    $id = $this->postJson('/api/v1/locations', [
        'warehouse_id' => $warehouse->id,
        'code' => 'BIN-OLD',
        'type' => 'storage',
    ])->json('data.id');

    $this->putJson('/api/v1/locations/'.$id, [
        'code' => 'BIN-NEW',
        'location_id' => $id,
        'warehouse_id' => $warehouse->id,
    ])->assertOk()
        ->assertJsonPath('data.code', 'BIN-NEW');

    $this->deleteJson('/api/v1/locations/'.$id)->assertNoContent();

    $this->getJson('/api/v1/locations/'.$id)->assertNotFound();
});

it('prevents viewer from creating location', function () {
    $tenant = Tenant::factory()->create();
    $warehouse = Warehouse::factory()->create(['tenant_id' => $tenant->id]);
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($user, 'viewer');

    Sanctum::actingAs($user);

    $this->postJson('/api/v1/locations', [
        'warehouse_id' => $warehouse->id,
        'code' => 'BIN-DENIED',
        'type' => 'storage',
    ])->assertForbidden();
});
