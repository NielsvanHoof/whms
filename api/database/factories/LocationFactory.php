<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Location;
use App\Models\Tenant;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Location>
 */
final class LocationFactory extends Factory
{
    protected $model = Location::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $tenant = Tenant::factory()->create();

        return [
            'tenant_id' => $tenant->id,
            'warehouse_id' => Warehouse::factory()->create(['tenant_id' => $tenant->id])->id,
            'code' => mb_strtoupper(fake()->bothify('BIN-###')),
            'type' => fake()->randomElement(['storage', 'staging', 'pick']),
        ];
    }
}
