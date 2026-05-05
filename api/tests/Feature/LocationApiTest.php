<?php

namespace Tests\Feature;

use App\Models\Location;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LocationApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_locations_require_authentication(): void
    {
        $this->getJson('/api/v1/locations')
            ->assertUnauthorized()
            ->assertHeader('content-type', 'application/json');
    }

    public function test_authenticated_user_can_list_and_create_locations(): void
    {
        $tenant = Tenant::factory()->create();
        $warehouse = Warehouse::factory()->create(['tenant_id' => $tenant->id]);
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

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
    }

    public function test_store_location_requires_valid_tenant_warehouse(): void
    {
        $tenantA = Tenant::factory()->create();
        $tenantB = Tenant::factory()->create();
        $warehouseB = Warehouse::factory()->create(['tenant_id' => $tenantB->id]);
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);

        Sanctum::actingAs($userA);

        $this->postJson('/api/v1/locations', [
            'warehouse_id' => $warehouseB->id,
            'code' => 'BIN-X01',
            'type' => 'storage',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['warehouse_id']);
    }

    public function test_store_location_rejects_duplicate_code_within_same_warehouse(): void
    {
        $tenant = Tenant::factory()->create();
        $warehouse = Warehouse::factory()->create(['tenant_id' => $tenant->id]);
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

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
    }

    public function test_user_cannot_view_location_from_another_tenant(): void
    {
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
        Sanctum::actingAs($userA);

        $this->getJson('/api/v1/locations/'.$locationB->id)
            ->assertNotFound();
    }

    public function test_user_can_update_and_delete_own_location(): void
    {
        $tenant = Tenant::factory()->create();
        $warehouse = Warehouse::factory()->create(['tenant_id' => $tenant->id]);
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

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
    }
}
