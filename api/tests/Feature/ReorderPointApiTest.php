<?php

declare(strict_types=1);

use App\Models\InventoryBalance;
use App\Models\Location;
use App\Models\Product;
use App\Models\ReorderPoint;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Warehouse;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Tests\Concerns\InteractsWithRbac;

uses(InteractsWithRbac::class);

beforeEach(fn () => $this->seedRbac());

it('requires authentication for reorder point endpoints', function () {
    $this->getJson('/api/v1/reorder-points')->assertUnauthorized();
    $this->getJson('/api/v1/reorder-points/low-stock')->assertUnauthorized();
});

it('allows manager to list and create reorder points', function () {
    $tenant = Tenant::factory()->create();
    $warehouse = Warehouse::factory()->create(['tenant_id' => $tenant->id]);
    $location = Location::factory()->create([
        'tenant_id' => $tenant->id,
        'warehouse_id' => $warehouse->id,
    ]);
    $product = Product::factory()->create(['tenant_id' => $tenant->id]);
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($user, 'manager');

    Sanctum::actingAs($user);

    $this->getJson('/api/v1/reorder-points')
        ->assertOk()
        ->assertJsonPath('data', []);

    $create = $this->postJson('/api/v1/reorder-points', [
        'product_id' => $product->id,
        'location_id' => $location->id,
        'quantity' => 20,
    ]);

    $create->assertCreated()
        ->assertJsonPath('data.product_id', $product->id)
        ->assertJsonPath('data.location_id', $location->id)
        ->assertJsonPath('data.quantity', 20);
});

it('requires valid tenant product and location when storing reorder point', function () {
    $tenantA = Tenant::factory()->create();
    $tenantB = Tenant::factory()->create();
    $productB = Product::factory()->create(['tenant_id' => $tenantB->id]);
    $warehouseB = Warehouse::factory()->create(['tenant_id' => $tenantB->id]);
    $locationB = Location::factory()->create([
        'tenant_id' => $tenantB->id,
        'warehouse_id' => $warehouseB->id,
    ]);
    $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
    $this->assignRole($userA, 'manager');

    Sanctum::actingAs($userA);

    $this->postJson('/api/v1/reorder-points', [
        'product_id' => $productB->id,
        'location_id' => $locationB->id,
        'quantity' => 10,
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['product_id', 'location_id']);
});

it('rejects duplicate reorder point for same product and location', function () {
    $tenant = Tenant::factory()->create();
    $warehouse = Warehouse::factory()->create(['tenant_id' => $tenant->id]);
    $location = Location::factory()->create([
        'tenant_id' => $tenant->id,
        'warehouse_id' => $warehouse->id,
    ]);
    $product = Product::factory()->create(['tenant_id' => $tenant->id]);
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($user, 'manager');

    Sanctum::actingAs($user);

    $this->postJson('/api/v1/reorder-points', [
        'product_id' => $product->id,
        'location_id' => $location->id,
        'quantity' => 10,
    ])->assertCreated();

    $this->postJson('/api/v1/reorder-points', [
        'product_id' => $product->id,
        'location_id' => $location->id,
        'quantity' => 30,
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['location_id']);
});

it('allows manager to update and delete own reorder point', function () {
    $tenant = Tenant::factory()->create();
    $warehouse = Warehouse::factory()->create(['tenant_id' => $tenant->id]);
    $location = Location::factory()->create([
        'tenant_id' => $tenant->id,
        'warehouse_id' => $warehouse->id,
    ]);
    $product = Product::factory()->create(['tenant_id' => $tenant->id]);
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($user, 'manager');

    Sanctum::actingAs($user);

    $id = $this->postJson('/api/v1/reorder-points', [
        'product_id' => $product->id,
        'location_id' => $location->id,
        'quantity' => 10,
    ])->json('data.id');

    $this->putJson('/api/v1/reorder-points/'.$id, [
        'quantity' => 50,
        'reorder_point_id' => $id,
    ])->assertOk()
        ->assertJsonPath('data.quantity', 50);

    $this->deleteJson('/api/v1/reorder-points/'.$id)->assertNoContent();

    $this->getJson('/api/v1/reorder-points/'.$id)->assertNotFound();
});

it('prevents viewer from creating reorder point', function () {
    $tenant = Tenant::factory()->create();
    $warehouse = Warehouse::factory()->create(['tenant_id' => $tenant->id]);
    $location = Location::factory()->create([
        'tenant_id' => $tenant->id,
        'warehouse_id' => $warehouse->id,
    ]);
    $product = Product::factory()->create(['tenant_id' => $tenant->id]);
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($user, 'viewer');

    Sanctum::actingAs($user);

    $this->postJson('/api/v1/reorder-points', [
        'product_id' => $product->id,
        'location_id' => $location->id,
        'quantity' => 10,
    ])->assertForbidden();
});

it('prevents user from viewing reorder point from another tenant', function () {
    $tenantA = Tenant::factory()->create();
    $tenantB = Tenant::factory()->create();
    $warehouseB = Warehouse::factory()->create(['tenant_id' => $tenantB->id]);
    $locationB = Location::factory()->create([
        'tenant_id' => $tenantB->id,
        'warehouse_id' => $warehouseB->id,
    ]);
    $productB = Product::factory()->create(['tenant_id' => $tenantB->id]);
    $reorderPointB = ReorderPoint::withoutGlobalScopes()->create([
        'tenant_id' => $tenantB->id,
        'product_id' => $productB->id,
        'location_id' => $locationB->id,
        'quantity' => 10,
    ]);

    $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
    $this->assignRole($userA, 'manager');
    Sanctum::actingAs($userA);

    $this->getJson('/api/v1/reorder-points/'.$reorderPointB->id)
        ->assertNotFound();
});

it('lists only reorder points at or below their on-hand quantity as low stock', function () {
    $tenant = Tenant::factory()->create();
    $warehouse = Warehouse::factory()->create(['tenant_id' => $tenant->id]);
    $lowLocation = Location::factory()->create([
        'tenant_id' => $tenant->id,
        'warehouse_id' => $warehouse->id,
    ]);
    $healthyLocation = Location::factory()->create([
        'tenant_id' => $tenant->id,
        'warehouse_id' => $warehouse->id,
    ]);
    $emptyLocation = Location::factory()->create([
        'tenant_id' => $tenant->id,
        'warehouse_id' => $warehouse->id,
    ]);
    $product = Product::factory()->create(['tenant_id' => $tenant->id]);
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($user, 'manager');

    $lowReorderPoint = ReorderPoint::factory()->create([
        'tenant_id' => $tenant->id,
        'product_id' => $product->id,
        'location_id' => $lowLocation->id,
        'quantity' => 20,
    ]);
    InventoryBalance::factory()->create([
        'tenant_id' => $tenant->id,
        'warehouse_id' => $warehouse->id,
        'location_id' => $lowLocation->id,
        'product_id' => $product->id,
        'quantity' => 5,
    ]);

    ReorderPoint::factory()->create([
        'tenant_id' => $tenant->id,
        'product_id' => $product->id,
        'location_id' => $healthyLocation->id,
        'quantity' => 20,
    ]);
    InventoryBalance::factory()->create([
        'tenant_id' => $tenant->id,
        'warehouse_id' => $warehouse->id,
        'location_id' => $healthyLocation->id,
        'product_id' => $product->id,
        'quantity' => 100,
    ]);

    ReorderPoint::factory()->create([
        'tenant_id' => $tenant->id,
        'product_id' => $product->id,
        'location_id' => $emptyLocation->id,
        'quantity' => 20,
    ]);

    Sanctum::actingAs($user);

    $response = $this->getJson('/api/v1/reorder-points/low-stock')->assertOk();

    $ids = collect($response->json('data'))->pluck('id');

    expect($ids)->toContain($lowReorderPoint->id);
    expect($ids)->toHaveCount(2);

    $lowRow = collect($response->json('data'))->firstWhere('id', $lowReorderPoint->id);
    expect($lowRow['on_hand_quantity'])->toBe(5);
    expect($lowRow['shortage'])->toBe(15);
});

it('prevents user without inventory view from listing low stock', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $user->givePermissionTo(Permission::findOrCreate('warehouses.view', 'web'));

    Sanctum::actingAs($user);

    $this->getJson('/api/v1/reorder-points/low-stock')->assertForbidden();
});
