<?php

declare(strict_types=1);

use App\Models\InventoryBalance;
use App\Models\InventoryMovement;
use App\Models\Location;
use App\Models\Product;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Warehouse;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\Concerns\InteractsWithRbac;

uses(InteractsWithRbac::class);

beforeEach(fn () => $this->seedRbac());

it('requires authentication for inventory endpoints', function () {
    $this->getJson('/api/v1/inventory-balances')->assertUnauthorized();
    $this->getJson('/api/v1/inventory-balances/1')->assertUnauthorized();
    $this->getJson('/api/v1/inventory-movements')->assertUnauthorized();
    $this->getJson('/api/v1/inventory-movements/1')->assertUnauthorized();
    $this->postJson('/api/v1/inventory-movements', [])->assertUnauthorized();
});

it('creates balance and movement on receipt', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($user, 'manager');

    $warehouse = Warehouse::factory()->create(['tenant_id' => $tenant->id]);
    $location = Location::factory()->create([
        'tenant_id' => $tenant->id,
        'warehouse_id' => $warehouse->id,
    ]);
    $product = Product::factory()->create(['tenant_id' => $tenant->id]);

    Sanctum::actingAs($user);

    $response = $this->postJson('/api/v1/inventory-movements', [
        'kind' => 'receipt',
        'location_id' => $location->id,
        'product_id' => $product->id,
        'quantity' => 25,
    ]);

    $response->assertCreated()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.kind', 'receipt')
        ->assertJsonPath('data.0.quantity_delta', 25);

    $this->getJson('/api/v1/inventory-balances?filter[product_id]='.$product->id)
        ->assertOk()
        ->assertJsonPath('data.0.quantity', 25)
        ->assertJsonPath('data.0.location_id', $location->id);
});

it('allows viewer to list balances but not post movements', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($user, 'viewer');

    Sanctum::actingAs($user);

    $this->getJson('/api/v1/inventory-balances')->assertOk();
    $this->getJson('/api/v1/inventory-movements')->assertOk();

    $warehouse = Warehouse::factory()->create(['tenant_id' => $tenant->id]);
    $location = Location::factory()->create([
        'tenant_id' => $tenant->id,
        'warehouse_id' => $warehouse->id,
    ]);
    $product = Product::factory()->create(['tenant_id' => $tenant->id]);

    $this->postJson('/api/v1/inventory-movements', [
        'kind' => 'receipt',
        'location_id' => $location->id,
        'product_id' => $product->id,
        'quantity' => 5,
    ])->assertForbidden();
});

it('moves stock between locations in same warehouse on transfer', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($user, 'manager');

    $warehouse = Warehouse::factory()->create(['tenant_id' => $tenant->id]);
    $from = Location::factory()->create([
        'tenant_id' => $tenant->id,
        'warehouse_id' => $warehouse->id,
    ]);
    $to = Location::factory()->create([
        'tenant_id' => $tenant->id,
        'warehouse_id' => $warehouse->id,
    ]);
    $product = Product::factory()->create(['tenant_id' => $tenant->id]);

    Sanctum::actingAs($user);

    $this->postJson('/api/v1/inventory-movements', [
        'kind' => 'receipt',
        'location_id' => $from->id,
        'product_id' => $product->id,
        'quantity' => 40,
    ])->assertCreated();

    $transfer = $this->postJson('/api/v1/inventory-movements', [
        'kind' => 'transfer',
        'from_location_id' => $from->id,
        'to_location_id' => $to->id,
        'product_id' => $product->id,
        'quantity' => 15,
    ]);

    $transfer->assertCreated()
        ->assertJsonCount(2, 'data');

    $correlation = $transfer->json('data.0.transfer_correlation_id');
    expect($correlation)->not->toBeNull();
    expect($transfer->json('data.1.transfer_correlation_id'))->toBe($correlation);

    $this->getJson('/api/v1/inventory-balances?filter[product_id]='.$product->id)
        ->assertOk();

    $balances = collect($transfer->json('data'));
    expect($balances->firstWhere('location_id', $from->id)['quantity_delta'])->toBe(-15);
    expect($balances->firstWhere('location_id', $to->id)['quantity_delta'])->toBe(15);
});

it('rejects transfer between different warehouses', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($user, 'manager');

    $w1 = Warehouse::factory()->create(['tenant_id' => $tenant->id]);
    $w2 = Warehouse::factory()->create(['tenant_id' => $tenant->id]);
    $from = Location::factory()->create([
        'tenant_id' => $tenant->id,
        'warehouse_id' => $w1->id,
    ]);
    $to = Location::factory()->create([
        'tenant_id' => $tenant->id,
        'warehouse_id' => $w2->id,
    ]);
    $product = Product::factory()->create(['tenant_id' => $tenant->id]);

    Sanctum::actingAs($user);

    $this->postJson('/api/v1/inventory-movements', [
        'kind' => 'transfer',
        'from_location_id' => $from->id,
        'to_location_id' => $to->id,
        'product_id' => $product->id,
        'quantity' => 1,
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['to_location_id']);
});

it('rejects transfer with insufficient stock', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($user, 'manager');

    $warehouse = Warehouse::factory()->create(['tenant_id' => $tenant->id]);
    $from = Location::factory()->create([
        'tenant_id' => $tenant->id,
        'warehouse_id' => $warehouse->id,
    ]);
    $to = Location::factory()->create([
        'tenant_id' => $tenant->id,
        'warehouse_id' => $warehouse->id,
    ]);
    $product = Product::factory()->create(['tenant_id' => $tenant->id]);

    Sanctum::actingAs($user);

    $this->postJson('/api/v1/inventory-movements', [
        'kind' => 'receipt',
        'location_id' => $from->id,
        'product_id' => $product->id,
        'quantity' => 3,
    ])->assertCreated();

    $this->postJson('/api/v1/inventory-movements', [
        'kind' => 'transfer',
        'from_location_id' => $from->id,
        'to_location_id' => $to->id,
        'product_id' => $product->id,
        'quantity' => 10,
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['quantity']);
});

it('prevents user from viewing balance from another tenant', function () {
    $tenantA = Tenant::factory()->create();
    $tenantB = Tenant::factory()->create();
    $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
    $this->assignRole($userA, 'manager');

    $warehouseB = Warehouse::factory()->create(['tenant_id' => $tenantB->id]);
    $locationB = Location::factory()->create([
        'tenant_id' => $tenantB->id,
        'warehouse_id' => $warehouseB->id,
    ]);
    $productB = Product::factory()->create(['tenant_id' => $tenantB->id]);

    $balanceB = InventoryBalance::withoutGlobalScopes()->create([
        'tenant_id' => $tenantB->id,
        'warehouse_id' => $warehouseB->id,
        'location_id' => $locationB->id,
        'product_id' => $productB->id,
        'quantity' => 9,
    ]);

    Sanctum::actingAs($userA);

    $this->getJson('/api/v1/inventory-balances/'.$balanceB->id)
        ->assertNotFound();
});

it('shows movement with related resources', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($user, 'manager');

    $warehouse = Warehouse::factory()->create(['tenant_id' => $tenant->id]);
    $location = Location::factory()->create([
        'tenant_id' => $tenant->id,
        'warehouse_id' => $warehouse->id,
    ]);
    $product = Product::factory()->create(['tenant_id' => $tenant->id]);

    Sanctum::actingAs($user);

    $movementId = $this->postJson('/api/v1/inventory-movements', [
        'kind' => 'receipt',
        'location_id' => $location->id,
        'product_id' => $product->id,
        'quantity' => 10,
    ])->assertCreated()->json('data.0.id');

    $this->getJson('/api/v1/inventory-movements/'.$movementId)
        ->assertOk()
        ->assertJsonPath('data.id', $movementId)
        ->assertJsonPath('data.kind', 'receipt')
        ->assertJsonPath('data.quantity_delta', 10)
        ->assertJsonPath('data.warehouse.id', $warehouse->id)
        ->assertJsonPath('data.location.id', $location->id)
        ->assertJsonPath('data.product.id', $product->id);
});

it('prevents user from showing movement from another tenant', function () {
    $tenantA = Tenant::factory()->create();
    $tenantB = Tenant::factory()->create();
    $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
    $this->assignRole($userA, 'manager');

    $warehouseB = Warehouse::factory()->create(['tenant_id' => $tenantB->id]);
    $locationB = Location::factory()->create([
        'tenant_id' => $tenantB->id,
        'warehouse_id' => $warehouseB->id,
    ]);
    $productB = Product::factory()->create(['tenant_id' => $tenantB->id]);

    $movementB = InventoryMovement::withoutGlobalScopes()->create([
        'tenant_id' => $tenantB->id,
        'kind' => 'receipt',
        'warehouse_id' => $warehouseB->id,
        'location_id' => $locationB->id,
        'product_id' => $productB->id,
        'quantity_delta' => 5,
        'user_id' => User::factory()->create(['tenant_id' => $tenantB->id])->id,
    ]);

    Sanctum::actingAs($userA);

    $this->getJson('/api/v1/inventory-movements/'.$movementB->id)
        ->assertNotFound();
});

it('prevents user without inventory view from showing movement', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $user->givePermissionTo(Permission::findOrCreate('warehouses.view', 'web'));

    $warehouse = Warehouse::factory()->create(['tenant_id' => $tenant->id]);
    $location = Location::factory()->create([
        'tenant_id' => $tenant->id,
        'warehouse_id' => $warehouse->id,
    ]);
    $product = Product::factory()->create(['tenant_id' => $tenant->id]);

    $movement = InventoryMovement::factory()->create([
        'tenant_id' => $tenant->id,
        'warehouse_id' => $warehouse->id,
        'location_id' => $location->id,
        'product_id' => $product->id,
        'user_id' => $user->id,
    ]);

    Sanctum::actingAs($user);

    $this->getJson('/api/v1/inventory-movements/'.$movement->id)
        ->assertForbidden();
});

it('prevents user without inventory view from listing balances', function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $user->givePermissionTo(Permission::findOrCreate('warehouses.view', 'web'));

    Sanctum::actingAs($user);

    $this->getJson('/api/v1/inventory-balances')->assertForbidden();
});
