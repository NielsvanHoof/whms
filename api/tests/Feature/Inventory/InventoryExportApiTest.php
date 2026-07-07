<?php

declare(strict_types=1);

namespace Tests\Feature\Inventory;

use App\Models\InventoryBalance;
use App\Models\InventoryMovement;
use App\Models\Location;
use App\Models\Product;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\InteractsWithRbac;
use Tests\TestCase;

final class InventoryExportApiTest extends TestCase
{
    use InteractsWithRbac;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedRbac();
    }

    public function test_manager_can_export_inventory_balances_csv(): void
    {
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
        $this->assertStringContainsString('product_sku', $response->streamedContent());
        $this->assertStringContainsString($product->sku, $response->streamedContent());
    }

    public function test_manager_can_export_inventory_movements_csv(): void
    {
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
        $this->assertStringContainsString('quantity_delta', $response->streamedContent());
    }

    public function test_viewer_can_export_inventory_balances(): void
    {
        $tenant = Tenant::factory()->create();
        $viewer = User::factory()->create(['tenant_id' => $tenant->id]);
        $this->assignRole($viewer, 'viewer');
        $tenant->makeCurrent();

        Sanctum::actingAs($viewer);

        $this->get('/api/v1/inventory-balances/export')->assertOk();
    }
}
