<?php

declare(strict_types=1);

namespace Tests\Feature\Mcp;

use App\Mcp\Servers\WhmsServer;
use App\Models\InventoryBalance;
use App\Models\Location;
use App\Models\Product;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\InteractsWithRbac;
use Tests\Concerns\InteractsWithWhmsMcp;
use Tests\TestCase;

final class RecordInventoryMovementToolTest extends TestCase
{
    use InteractsWithRbac;
    use InteractsWithWhmsMcp;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedRbac();
    }

    public function test_receipt_creates_balance_and_movement_via_mcp_tool(): void
    {
        ['tenant' => $tenant, 'user' => $user] = $this->actingAsTenantUser('manager');

        $warehouse = Warehouse::factory()->create(['tenant_id' => $tenant->id]);
        $location = Location::factory()->create([
            'tenant_id' => $tenant->id,
            'warehouse_id' => $warehouse->id,
        ]);
        $product = Product::factory()->create(['tenant_id' => $tenant->id]);

        $response = WhmsServer::actingAs($user)->tool(\App\Mcp\Tools\RecordInventoryMovementTool::class, [
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
    }

    public function test_viewer_cannot_record_inventory_movement(): void
    {
        ['tenant' => $tenant, 'user' => $user] = $this->actingAsTenantUser('viewer');

        $warehouse = Warehouse::factory()->create(['tenant_id' => $tenant->id]);
        $location = Location::factory()->create([
            'tenant_id' => $tenant->id,
            'warehouse_id' => $warehouse->id,
        ]);
        $product = Product::factory()->create(['tenant_id' => $tenant->id]);

        $response = WhmsServer::actingAs($user)->tool(\App\Mcp\Tools\RecordInventoryMovementTool::class, [
            'kind' => 'receipt',
            'location_id' => $location->id,
            'product_id' => $product->id,
            'quantity' => 5,
        ]);

        $response->assertHasErrors();
    }

    public function test_receipt_validation_error_returns_actionable_message(): void
    {
        ['user' => $user] = $this->actingAsTenantUser('manager');

        $response = WhmsServer::actingAs($user)->tool(\App\Mcp\Tools\RecordInventoryMovementTool::class, [
            'kind' => 'receipt',
            'location_id' => 999999,
            'product_id' => 999999,
            'quantity' => 0,
        ]);

        $response->assertHasErrors();
    }

    public function test_list_inventory_balances_respects_pagination_cap(): void
    {
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

        $response = WhmsServer::actingAs($user)->tool(\App\Mcp\Tools\ListInventoryBalancesTool::class, [
            'per_page' => 500,
        ]);

        $response
            ->assertOk()
            ->assertSee('"per_page": 50');
    }
}
