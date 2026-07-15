<?php

declare(strict_types=1);

use App\Models\Tenant;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\InteractsWithRbac;

uses(InteractsWithRbac::class);

beforeEach(fn () => $this->seedRbac());

it('requires authentication for warehouses', function () {
    $this->getJson('/api/v1/warehouses')
        ->assertUnauthorized()
        ->assertHeader('content-type', 'application/json');
});

it('requires authentication for warehouses without json accept header', function () {
    $this->get('/api/v1/warehouses')
        ->assertUnauthorized()
        ->assertHeader('content-type', 'application/json');
});

it('allows authenticated user to list and create warehouses', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create([
        'tenant_id' => $tenant->id,
        'password' => Hash::make('password'),
    ]);
    $this->assignRole($user, 'manager');

    Sanctum::actingAs($user);

    $this->getJson('/api/v1/warehouses')
        ->assertOk()
        ->assertJsonPath('data', []);

    $create = $this->postJson('/api/v1/warehouses', [
        'name' => 'Main DC',
        'code' => 'MAIN-01',
    ]);

    $create->assertCreated()
        ->assertJsonPath('data.name', 'Main DC')
        ->assertJsonPath('data.code', 'MAIN-01')
        ->assertJsonPath('data.tenant_id', $tenant->id);

    $this->getJson('/api/v1/warehouses')
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

it('allows authenticated user to filter and sort warehouses', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($user, 'manager');

    Sanctum::actingAs($user);

    Warehouse::create([
        'tenant_id' => $tenant->id,
        'name' => 'Alpha Storage',
        'code' => 'ALPHA',
    ]);

    Warehouse::create([
        'tenant_id' => $tenant->id,
        'name' => 'Beta Hub',
        'code' => 'BETA',
    ]);

    $this->getJson('/api/v1/warehouses?filter[name]=Alpha')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.code', 'ALPHA');

    $this->getJson('/api/v1/warehouses?filter[code]=BETA')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Beta Hub');

    $this->getJson('/api/v1/warehouses?sort=name')
        ->assertOk()
        ->assertJsonPath('data.0.name', 'Alpha Storage')
        ->assertJsonPath('data.1.name', 'Beta Hub');
});

it('validates required fields when storing warehouse', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($user, 'manager');

    Sanctum::actingAs($user);

    $this->postJson('/api/v1/warehouses', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name']);
});

it('rejects duplicate warehouse code within tenant', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($user, 'manager');

    Sanctum::actingAs($user);

    $this->postJson('/api/v1/warehouses', [
        'name' => 'First',
        'code' => 'DUP',
    ])->assertCreated();

    $this->postJson('/api/v1/warehouses', [
        'name' => 'Second',
        'code' => 'DUP',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['code']);
});

it('prevents user from viewing warehouse from another tenant', function () {
    $tenantA = Tenant::factory()->create();
    $tenantB = Tenant::factory()->create();
    $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
    $this->assignRole($userA, 'manager');

    $warehouseB = Warehouse::withoutGlobalScopes()->create([
        'tenant_id' => $tenantB->id,
        'name' => 'Other tenant',
        'code' => 'OTHER',
    ]);

    Sanctum::actingAs($userA);

    $this->getJson('/api/v1/warehouses/'.$warehouseB->id)
        ->assertNotFound();
});

it('allows user to update and delete own tenant warehouse', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($user, 'manager');

    Sanctum::actingAs($user);

    $id = $this->postJson('/api/v1/warehouses', [
        'name' => 'Original',
        'code' => 'O-1',
    ])->json('data.id');

    $this->putJson('/api/v1/warehouses/'.$id, [
        'name' => 'Renamed',
        'warehouse_id' => $id,
    ])->assertOk()
        ->assertJsonPath('data.name', 'Renamed');

    $this->deleteJson('/api/v1/warehouses/'.$id)
        ->assertNoContent();

    $this->getJson('/api/v1/warehouses/'.$id)
        ->assertNotFound();
});

it('prevents viewer from creating warehouse', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($user, 'viewer');

    Sanctum::actingAs($user);

    $this->postJson('/api/v1/warehouses', [
        'name' => 'Denied Warehouse',
        'code' => 'DENIED',
    ])->assertForbidden();
});
