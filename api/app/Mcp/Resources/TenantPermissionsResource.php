<?php

declare(strict_types=1);

namespace App\Mcp\Resources;

use App\Mcp\Concerns\EncodesMcpJson;
use App\Models\User;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\MimeType;
use Laravel\Mcp\Server\Attributes\Uri;
use Laravel\Mcp\Server\Resource;

#[Description('Lists the authenticated user roles and permissions so agents know what actions are allowed.')]
#[MimeType('application/json')]
#[Uri('whms://permissions')]
final class TenantPermissionsResource extends Resource
{
    use EncodesMcpJson;

    public function shouldRegister(Request $request): bool
    {
        return $request->user() !== null;
    }

    public function handle(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        /** @var list<string> $roles */
        $roles = $user->roles()->pluck('name')->values()->all();

        /** @var list<string> $permissions */
        $permissions = $user->getAllPermissions()
            ->pluck('name')
            ->sort()
            ->values()
            ->all();

        return $this->json([
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }
}
