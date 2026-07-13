<?php

declare(strict_types=1);

use App\Models\Product;
use App\Models\Tenant;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\InteractsWithRbac;

uses(InteractsWithRbac::class);

beforeEach(fn () => $this->seedRbac());

it('requires authentication for products', function () {
    $this->getJson('/api/v1/products')
        ->assertUnauthorized()
        ->assertHeader('content-type', 'application/json');
});

it('allows authenticated user to list and create products', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($user, 'manager');

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
});

it('requires unique sku per tenant when storing product', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($user, 'manager');
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
});

it('prevents user from viewing product from another tenant', function () {
    $tenantA = Tenant::factory()->create();
    $tenantB = Tenant::factory()->create();
    $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
    $this->assignRole($userA, 'manager');

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
});

it('allows user to update and delete own product', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($user, 'manager');
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
});

it('prevents viewer from creating product', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $this->assignRole($user, 'viewer');

    Sanctum::actingAs($user);

    $this->postJson('/api/v1/products', [
        'sku' => 'SKU-DENIED',
        'name' => 'Denied Product',
        'unit' => 'each',
        'is_active' => true,
    ])->assertForbidden();
});
