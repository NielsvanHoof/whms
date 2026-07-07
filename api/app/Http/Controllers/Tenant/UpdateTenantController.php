<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Data\Tenant\UpdateTenantData;
use App\Http\Controllers\Controller;
use App\Http\Resources\TenantResource;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;

final class UpdateTenantController extends Controller
{
    /**
     * Update the authenticated user's current workspace identity.
     */
    public function __invoke(UpdateTenantData $data, Request $request): TenantResource
    {
        /** @var User $user */
        $user = $request->user();

        if (! $user->can('tenant.manage')) {
            abort(403);
        }

        $tenant = Tenant::current();

        if ($tenant === null) {
            abort(404);
        }

        $tenant->update($data->toModelAttributes());

        return new TenantResource($tenant);
    }
}
