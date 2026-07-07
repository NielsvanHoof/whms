<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    public function up(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        Permission::findOrCreate('tenant.manage', 'web');

        Role::query()
            ->where('guard_name', 'web')
            ->whereIn('name', ['owner', 'manager'])
            ->get()
            ->each(fn (Role $role) => $role->givePermissionTo('tenant.manage'));
    }

    public function down(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permission = Permission::query()
            ->where('guard_name', 'web')
            ->where('name', 'tenant.manage')
            ->first();

        if ($permission !== null) {
            $permission->delete();
        }
    }
};
