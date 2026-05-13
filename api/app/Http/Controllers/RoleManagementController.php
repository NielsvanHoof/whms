<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Access\SyncUserRolesData;
use App\Http\Resources\AccessPermissionResource;
use App\Http\Resources\AccessRoleResource;
use App\Http\Resources\AccessUserResource;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

final class RoleManagementController extends Controller
{
    public function roles(Request $request): AnonymousResourceCollection
    {
        $this->ensureCanViewRoles($request->user());

        $roles = Role::query()
            ->where('guard_name', 'web')
            ->with('permissions:id,name')
            ->orderBy('name')
            ->get(['id', 'name']);

        return AccessRoleResource::collection($roles);
    }

    public function permissions(Request $request): AnonymousResourceCollection
    {
        $this->ensureCanViewRoles($request->user());

        $permissions = Permission::query()
            ->where('guard_name', 'web')
            ->orderBy('name')
            ->get(['id', 'name']);

        return AccessPermissionResource::collection($permissions);
    }

    public function users(Request $request): AnonymousResourceCollection
    {
        $this->ensureCanViewRoles($request->user());

        $tenantId = Tenant::current()?->getKey();

        $users = User::query()
            ->where('tenant_id', $tenantId)
            ->with('roles:id,name')
            ->orderBy('name')
            ->get(['id', 'tenant_id', 'name', 'email']);

        return AccessUserResource::collection($users);
    }

    public function syncUserRoles(SyncUserRolesData $data, Request $request, User $user): JsonResource
    {
        $actor = $request->user();

        $this->ensureCanManageRoles($actor);

        if ((int) $actor->tenant_id !== (int) $user->tenant_id) {
            abort(404);
        }

        $user->syncRoles($data->roles);

        return new AccessUserResource($user->load('roles:id,name'));
    }

    private function ensureCanViewRoles(?User $user): void
    {
        if ($user === null || ! $user->can('roles.view')) {
            abort(403);
        }
    }

    private function ensureCanManageRoles(?User $user): void
    {
        if ($user === null || ! $user->can('roles.manage')) {
            abort(403);
        }
    }
}
