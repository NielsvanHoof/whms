<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\InventoryBalance;
use App\Models\Location;
use App\Models\Product;
use App\Models\Tenant;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InventoryBalance>
 */
final class InventoryBalanceFactory extends Factory
{
    protected $model = InventoryBalance::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $tenant = Tenant::factory()->create();
        $warehouse = Warehouse::factory()->create(['tenant_id' => $tenant->id]);
        $location = Location::factory()->create([
            'tenant_id' => $tenant->id,
            'warehouse_id' => $warehouse->id,
        ]);
        $product = Product::factory()->create(['tenant_id' => $tenant->id]);

        return [
            'tenant_id' => $tenant->id,
            'warehouse_id' => $warehouse->id,
            'location_id' => $location->id,
            'product_id' => $product->id,
            'quantity' => fake()->numberBetween(0, 500),
        ];
    }
}
