<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\InventoryMovement;
use App\Models\User;

final class InventoryMovementPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('inventory.view');
    }

    public function view(User $user, InventoryMovement $inventoryMovement): bool
    {
        return $user->can('inventory.view')
            && (int) $user->tenant_id === (int) $inventoryMovement->tenant_id;
    }

    public function create(User $user): bool
    {
        return $user->can('inventory.manage');
    }
}
