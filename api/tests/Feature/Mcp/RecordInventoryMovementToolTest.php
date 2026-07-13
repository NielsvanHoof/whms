<?php

declare(strict_types=1);

use App\Mcp\Servers\WhmsServer;
use App\Models\InventoryBalance;
use App\Models\Location;
use App\Models\Product;
use App\Models\Warehouse;
use Tests\Concerns\InteractsWithRbac;
use Tests\Concerns\InteractsWithWhmsMcp;

uses(InteractsWithRbac::class, InteractsWithWhmsMcp::class);

beforeEach(fn () => $this->seedRbac());

it('creates balance and movement via mcp tool on receipt', function () {
    ['tenant' => $tenant, 'user' => $user] = $this->actingAsTenantUser('manager');

    $warehouse = Warehouse::factory()->create(['tenant_id' => $tenant->id]);
    $location = Location::factory()->create([
        'tenant_id' => $tenant->id,
        'warehouse_id' => $warehouse->id,
    ]);
    $product = Product::factory()->create(['tenant_id' => $tenant->id]);

    $response = WhmsServer::actingAs($user)->tool(App\Mcp\Tools\RecordInventoryMovementTool::class, [
        'kind' => 'receipt',
        'location_id' => $location->id,
        'product_id' => $product->id,
        'quantity' => 25,
    ]);

    $response
        ->assertOk()
        ->assertSee('receipt')
        ->assertSee('25');

    $this->assertDatabaseHas('inventory_balances', [
        'tenant_id' => $tenant->id,
        'location_id' => $location->id,
        'product_id' => $product->id,
        'quantity' => 25,
    ]);
});

it('prevents viewer from recording inventory movement', function () {
    ['tenant' => $tenant, 'user' => $user] = $this->actingAsTenantUser('viewer');

    $warehouse = Warehouse::factory()->create(['tenant_id' => $tenant->id]);
    $location = Location::factory()->create([
        'tenant_id' => $tenant->id,
        'warehouse_id' => $warehouse->id,
    ]);
    $product = Product::factory()->create(['tenant_id' => $tenant->id]);

    $response = WhmsServer::actingAs($user)->tool(App\Mcp\Tools\RecordInventoryMovementTool::class, [
        'kind' => 'receipt',
        'location_id' => $location->id,
        'product_id' => $product->id,
        'quantity' => 5,
    ]);

    $response->assertHasErrors();
});

it('returns actionable message on receipt validation error', function () {
    ['user' => $user] = $this->actingAsTenantUser('manager');

    $response = WhmsServer::actingAs($user)->tool(App\Mcp\Tools\RecordInventoryMovementTool::class, [
        'kind' => 'receipt',
        'location_id' => 999999,
        'product_id' => 999999,
        'quantity' => 0,
    ]);

    $response->assertHasErrors();
});

it('respects pagination cap when listing inventory balances', function () {
    ['tenant' => $tenant, 'user' => $user] = $this->actingAsTenantUser('manager');

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
        'quantity' => 10,
    ]);

    $response = WhmsServer::actingAs($user)->tool(App\Mcp\Tools\ListInventoryBalancesTool::class, [
        'per_page' => 500,
    ]);

    $response
        ->assertOk()
        ->assertSee('"per_page": 50');
});
