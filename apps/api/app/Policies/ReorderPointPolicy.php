<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\ReorderPoint;
use App\Models\User;

final class ReorderPointPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('inventory.view');
    }

    public function view(User $user, ReorderPoint $reorderPoint): bool
    {
        return $user->can('inventory.view')
            && (int) $user->tenant_id === (int) $reorderPoint->tenant_id;
    }

    public function create(User $user): bool
    {
        return $user->can('inventory.manage');
    }

    public function update(User $user, ReorderPoint $reorderPoint): bool
    {
        return $user->can('inventory.manage')
            && (int) $user->tenant_id === (int) $reorderPoint->tenant_id;
    }

    public function delete(User $user, ReorderPoint $reorderPoint): bool
    {
        return $user->can('inventory.manage')
            && (int) $user->tenant_id === (int) $reorderPoint->tenant_id;
    }
}
