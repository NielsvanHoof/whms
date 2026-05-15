<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\InventoryBalance;
use App\Models\Location;
use App\Models\Product;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\Concerns\InteractsWithRbac;
use Tests\TestCase;

final class InventoryApiTest extends TestCase
{
    use InteractsWithRbac;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedRbac();
    }

    public function test_inventory_endpoints_require_authentication(): void
    {
        $this->getJson('/api/v1/inventory-balances')->assertUnauthorized();
        $this->getJson('/api/v1/inventory-balances/1')->assertUnauthorized();
        $this->getJson('/api/v1/inventory-movements')->assertUnauthorized();
        $this->postJson('/api/v1/inventory-movements', [])->assertUnauthorized();
    }

    public function test_receipt_creates_balance_and_movement(): void
    {
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
    }

    public function test_viewer_can_list_balances_but_cannot_post_movements(): void
    {
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
    }

    public function test_transfer_moves_stock_between_locations_in_same_warehouse(): void
    {
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
        $this->assertNotNull($correlation);
        $this->assertSame($correlation, $transfer->json('data.1.transfer_correlation_id'));

        $this->getJson('/api/v1/inventory-balances?filter[product_id]='.$product->id)
            ->assertOk();

        $balances = collect($transfer->json('data'));
        $this->assertSame(-15, $balances->firstWhere('location_id', $from->id)['quantity_delta']);
        $this->assertSame(15, $balances->firstWhere('location_id', $to->id)['quantity_delta']);
    }

    public function test_transfer_rejects_different_warehouses(): void
    {
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
    }

    public function test_transfer_rejects_insufficient_stock(): void
    {
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
    }

    public function test_user_cannot_view_balance_from_another_tenant(): void
    {
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
    }

    public function test_user_without_inventory_view_cannot_list_balances(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $user->givePermissionTo(Permission::findOrCreate('warehouses.view', 'web'));

        Sanctum::actingAs($user);

        $this->getJson('/api/v1/inventory-balances')->assertForbidden();
    }
}
