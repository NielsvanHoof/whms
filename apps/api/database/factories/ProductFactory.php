<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Product;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
final class ProductFactory extends Factory
{
    protected $model = Product::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'sku' => mb_strtoupper(fake()->bothify('SKU-####')),
            'name' => fake()->words(3, true),
            'unit' => fake()->randomElement(['each', 'box', 'pallet']),
            'is_active' => true,
        ];
    }
}
