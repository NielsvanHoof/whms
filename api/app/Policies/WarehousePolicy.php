<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use App\Models\Warehouse;

/**
 * Authorization for warehouse resources (second line of defense next to tenant global scope).
 */
final class WarehousePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('warehouses.view');
    }

    public function view(User $user, Warehouse $warehouse): bool
    {
        return $user->can('warehouses.view')
            && (int) $user->tenant_id === (int) $warehouse->tenant_id;
    }

    public function create(User $user): bool
    {
        return $user->can('warehouses.manage');
    }

    public function update(User $user, Warehouse $warehouse): bool
    {
        return $user->can('warehouses.manage')
            && (int) $user->tenant_id === (int) $warehouse->tenant_id;
    }

    public function delete(User $user, Warehouse $warehouse): bool
    {
        return $user->can('warehouses.manage')
            && (int) $user->tenant_id === (int) $warehouse->tenant_id;
    }
}
