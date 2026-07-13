<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Location;
use App\Models\Product;
use App\Models\ReorderPoint;
use App\Models\Tenant;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ReorderPoint>
 */
final class ReorderPointFactory extends Factory
{
    protected $model = ReorderPoint::class;

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
            'product_id' => $product->id,
            'location_id' => $location->id,
            'quantity' => fake()->numberBetween(5, 100),
        ];
    }
}
