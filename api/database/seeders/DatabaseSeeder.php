<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

final class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'warehouses.view',
            'warehouses.manage',
            'products.view',
            'products.manage',
            'locations.view',
            'locations.manage',
            'inventory.view',
            'inventory.manage',
            'roles.view',
            'roles.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $roles = [
            'owner' => $permissions,
            'manager' => $permissions,
            'operator' => [
                'warehouses.view',
                'products.view',
                'products.manage',
                'locations.view',
                'locations.manage',
                'inventory.view',
                'inventory.manage',
            ],
            'viewer' => [
                'warehouses.view',
                'products.view',
                'locations.view',
                'inventory.view',
            ],
        ];

        foreach ($roles as $roleName => $rolePermissions) {
            $role = Role::findOrCreate($roleName, 'web');
            $permissionsForRole = Permission::query()
                ->where('guard_name', 'web')
                ->whereIn('name', $rolePermissions)
                ->get();

            $role->syncPermissions($permissionsForRole);
        }

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

        foreach ($tenants as $index => $seedData) {
            $tenant = Tenant::query()->create($seedData['tenant']);

            $user = User::factory()->create([
                'tenant_id' => $tenant->id,
                'name' => $seedData['user']['name'],
                'email' => $seedData['user']['email'],
                'password' => Hash::make('password'),
            ]);

            $user->assignRole($index === 0 ? 'owner' : 'viewer');

            Warehouse::factory()
                ->count(10)
                ->create([
                    'tenant_id' => $tenant->id,
                ]);
        }
    }
}
