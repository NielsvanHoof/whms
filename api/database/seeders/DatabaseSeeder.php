<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $tenants = [
            [
                'tenant' => [
                    'name' => 'Demo Tenant',
                    'slug' => 'demo',
                ],
                'user' => [
                    'name' => 'Test User',
                    'email' => 'test@example.com',
                ],
            ],
            [
                'tenant' => [
                    'name' => 'Second Demo Tenant',
                    'slug' => 'demo-second',
                ],
                'user' => [
                    'name' => 'Second Test User',
                    'email' => 'test-second@example.com',
                ],
            ],
        ];

        foreach ($tenants as $seedData) {
            $tenant = Tenant::query()->create($seedData['tenant']);

            User::factory()->create([
                'tenant_id' => $tenant->id,
                'name' => $seedData['user']['name'],
                'email' => $seedData['user']['email'],
                'password' => Hash::make('password'),
            ]);

            Warehouse::factory()
                ->count(10)
                ->create([
                    'tenant_id' => $tenant->id,
                ]);
        }
    }
}
