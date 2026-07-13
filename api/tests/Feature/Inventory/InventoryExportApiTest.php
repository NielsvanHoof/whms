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
use Tests\Concerns\InteractsWithRbac;

uses(InteractsWithRbac::class);

beforeEach(fn () => $this->seedRbac());

it('allows manager to export inventory balances csv', function () {
    $tenant = Tenant::factory()->create();
    $manager = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($manager, 'manager');
    $tenant->makeCurrent();

    $warehouse = Warehouse::factory()->create(['tenant_id' => $tenant->id]);
    $location = Location::factory()->create([
        'tenant_id' => $tenant->id,
        'warehouse_id' => $warehouse->id,
    ]);
    $product = Product::factory()->create(['tenant_id' => $tenant->id]);

    InventoryBalance::factory()->create([
        'tenant_id' => $tenant->id,
        'warehouse_id' => $warehouse->id,
        'location_id' => $location->id,
        'product_id' => $product->id,
        'quantity' => 42,
    ]);

    Sanctum::actingAs($manager);

    $response = $this->get('/api/v1/inventory-balances/export');

    $response->assertOk();
    $response->assertHeader('content-type', 'text/csv; charset=UTF-8');

    $content = downloadContent($response);
    expect($content)->toContain('product_sku');
    expect($content)->toContain($product->sku);
});

it('allows manager to export inventory movements csv', function () {
    $tenant = Tenant::factory()->create();
    $manager = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($manager, 'manager');
    $tenant->makeCurrent();

    $warehouse = Warehouse::factory()->create(['tenant_id' => $tenant->id]);
    $location = Location::factory()->create([
        'tenant_id' => $tenant->id,
        'warehouse_id' => $warehouse->id,
    ]);
    $product = Product::factory()->create(['tenant_id' => $tenant->id]);

    InventoryMovement::factory()->create([
        'tenant_id' => $tenant->id,
        'warehouse_id' => $warehouse->id,
        'location_id' => $location->id,
        'product_id' => $product->id,
        'quantity_delta' => 5,
    ]);

    Sanctum::actingAs($manager);

    $response = $this->get('/api/v1/inventory-movements/export');

    $response->assertOk();
    $response->assertHeader('content-type', 'text/csv; charset=UTF-8');

    $content = downloadContent($response);
    expect($content)->toContain('quantity_delta');
});

it('allows viewer to export inventory balances', function () {
    $tenant = Tenant::factory()->create();
    $viewer = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($viewer, 'viewer');
    $tenant->makeCurrent();

    Sanctum::actingAs($viewer);

    $this->get('/api/v1/inventory-balances/export')->assertOk();
});
