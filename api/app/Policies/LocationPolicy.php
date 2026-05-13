<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Location;
use App\Models\User;

final class LocationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('locations.view');
    }

    public function view(User $user, Location $location): bool
    {
        return $user->can('locations.view')
            && (int) $user->tenant_id === (int) $location->tenant_id;
    }

    public function create(User $user): bool
    {
        return $user->can('locations.manage');
    }

    public function update(User $user, Location $location): bool
    {
        return $user->can('locations.manage')
            && (int) $user->tenant_id === (int) $location->tenant_id;
    }

    public function delete(User $user, Location $location): bool
    {
        return $user->can('locations.manage')
            && (int) $user->tenant_id === (int) $location->tenant_id;
    }
}
