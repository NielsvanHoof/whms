<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\InventoryMovementKind;
use App\Models\InventoryMovement;
use App\Models\Location;
use App\Models\Product;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InventoryMovement>
 */
final class InventoryMovementFactory extends Factory
{
    protected $model = InventoryMovement::class;

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
            'kind' => InventoryMovementKind::Receipt,
            'warehouse_id' => $warehouse->id,
            'location_id' => $location->id,
            'product_id' => $product->id,
            'quantity_delta' => fake()->numberBetween(1, 100),
            'transfer_correlation_id' => null,
            'user_id' => User::factory()->create(['tenant_id' => $tenant->id])->id,
        ];
    }
}
