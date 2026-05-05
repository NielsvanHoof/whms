<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            "tenant_id" => Tenant::factory(),
            "sku" => strtoupper(fake()->bothify("SKU-####")),
            "name" => fake()->words(3, true),
            "unit" => fake()->randomElement(["each", "box", "pallet"]),
            "is_active" => true,
        ];
    }
}