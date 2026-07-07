<?php

declare(strict_types=1);

namespace Tests\Concerns;

use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

trait InteractsWithRbac
{
    protected function seedRbac(): void
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
            'tenant.manage',
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
    }

    protected function assignRole(User $user, string $role): User
    {
        $user->assignRole($role);

        return $user;
    }
}
