<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\InventoryBalance;
use App\Models\User;

final class InventoryBalancePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('inventory.view');
    }

    public function view(User $user, InventoryBalance $inventoryBalance): bool
    {
        return $user->can('inventory.view')
            && (int) $user->tenant_id === (int) $inventoryBalance->tenant_id;
    }
}
