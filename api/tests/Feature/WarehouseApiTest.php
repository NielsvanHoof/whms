<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class WarehouseApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_warehouses_require_authentication(): void
    {
        $this->getJson('/api/v1/warehouses')
            ->assertUnauthorized()
            ->assertHeader('content-type', 'application/json');
    }

    /**
     * Browsers often omit Accept: application/json; auth middleware must not resolve route('login').
     */
    public function test_warehouses_require_authentication_without_json_accept_header(): void
    {
        $this->get('/api/v1/warehouses')
            ->assertUnauthorized()
            ->assertHeader('content-type', 'application/json');
    }

    public function test_authenticated_user_can_list_and_create_warehouses(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create([
            'tenant_id' => $tenant->id,
            'password' => Hash::make('password'),
        ]);

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
    }

    public function test_authenticated_user_can_filter_and_sort_warehouses(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

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
    }

    public function test_store_warehouse_validates_required_fields(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/warehouses', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    }

    public function test_store_warehouse_rejects_duplicate_code_within_tenant(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

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
    }

    public function test_user_cannot_view_warehouse_from_another_tenant(): void
    {
        $tenantA = Tenant::factory()->create();
        $tenantB = Tenant::factory()->create();
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);

        $warehouseB = Warehouse::withoutGlobalScopes()->create([
            'tenant_id' => $tenantB->id,
            'name' => 'Other tenant',
            'code' => 'OTHER',
        ]);

        Sanctum::actingAs($userA);

        $this->getJson('/api/v1/warehouses/'.$warehouseB->id)
            ->assertNotFound();
    }

    public function test_user_can_update_and_delete_own_tenant_warehouse(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

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
    }
}
