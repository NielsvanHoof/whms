<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
final class MeResource extends JsonResource
{
    /**
     * @return array{
     *   user: UserResource,
     *   tenant?: TenantResource,
     *   roles: list<string>,
     *   permissions: list<string>
     * }
     */
    public function toArray(Request $request): array
    {
        /** @var string[] $roles */
        $roles = $this->roles->pluck('name')->values()->all();

        /** @var string[] $permissions */
        $permissions = $this->getAllPermissions()
            ->pluck('name')
            ->sort()
            ->values()
            ->all();

        return [
            'user' => new UserResource($this->resource),
            'tenant' => TenantResource::make($this->whenLoaded('tenant')),
            /** @var string[] */
            'roles' => $roles,
            /** @var string[] */
            'permissions' => $permissions,
        ];
    }
}
