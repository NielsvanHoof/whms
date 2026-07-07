<?php

declare(strict_types=1);

namespace App\Mcp\Tools;

use App\Http\Resources\MeResource;
use App\Mcp\Concerns\EncodesMcpJson;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Description('Returns the authenticated user, tenant, roles, and permissions for the current session.')]
#[IsReadOnly]
final class GetMeTool extends Tool
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

        $user->loadMissing([
            'roles:id,name',
            'tenant:id,name,slug',
        ]);

        return $this->jsonResource(new MeResource($user));
    }

    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [];
    }
}
