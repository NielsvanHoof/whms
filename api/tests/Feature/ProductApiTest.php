<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_products_require_authentication(): void
    {
        $this->getJson('/api/v1/products')
            ->assertUnauthorized()
            ->assertHeader('content-type', 'application/json');
    }

    public function test_authenticated_user_can_list_and_create_products(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        Sanctum::actingAs($user);

        $this->getJson('/api/v1/products')
            ->assertOk()
            ->assertJsonPath('data', []);

        $create = $this->postJson('/api/v1/products', [
            'sku' => 'SKU-1001',
            'name' => 'Widget A',
            'unit' => 'each',
            'is_active' => true,
        ]);

        $create->assertCreated()
            ->assertJsonPath('data.sku', 'SKU-1001')
            ->assertJsonPath('data.name', 'Widget A')
            ->assertJsonPath('data.tenant_id', $tenant->id);
    }

    public function test_store_product_requires_unique_sku_per_tenant(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/products', [
            'sku' => 'SKU-DUP',
            'name' => 'First',
            'unit' => 'each',
            'is_active' => true,
        ])->assertCreated();

        $this->postJson('/api/v1/products', [
            'sku' => 'SKU-DUP',
            'name' => 'Second',
            'unit' => 'each',
            'is_active' => true,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['sku']);
    }

    public function test_user_cannot_view_product_from_another_tenant(): void
    {
        $tenantA = Tenant::factory()->create();
        $tenantB = Tenant::factory()->create();
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);

        $productB = Product::withoutGlobalScopes()->create([
            'tenant_id' => $tenantB->id,
            'sku' => 'SKU-OTHER',
            'name' => 'Other',
            'unit' => 'each',
            'is_active' => true,
        ]);

        Sanctum::actingAs($userA);

        $this->getJson('/api/v1/products/'.$productB->id)
            ->assertNotFound();
    }

    public function test_user_can_update_and_delete_own_product(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $id = $this->postJson('/api/v1/products', [
            'sku' => 'SKU-2001',
            'name' => 'Initial',
            'unit' => 'each',
            'is_active' => true,
        ])->json('data.id');

        $this->putJson('/api/v1/products/'.$id, [
            'name' => 'Updated Name',
            'product_id' => $id,
        ])->assertOk()
            ->assertJsonPath('data.name', 'Updated Name');

        $this->deleteJson('/api/v1/products/'.$id)->assertNoContent();

        $this->getJson('/api/v1/products/'.$id)->assertNotFound();
    }
}
