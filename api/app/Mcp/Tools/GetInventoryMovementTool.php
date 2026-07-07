<?php

declare(strict_types=1);

namespace App\Mcp\Tools;

use App\Http\Resources\InventoryMovementResource;
use App\Mcp\Concerns\EncodesMcpJson;
use App\Mcp\Concerns\RegistersForPermission;
use App\Models\InventoryMovement;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Gate;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Description('Returns a single inventory movement ledger row by ID for the current tenant.')]
#[IsReadOnly]
final class GetInventoryMovementTool extends Tool
{
    use EncodesMcpJson;
    use RegistersForPermission;

    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'inventory_movement_id' => ['required', 'integer', 'min:1'],
        ]);

        $movement = InventoryMovement::query()
            ->with(['warehouse', 'location', 'product'])
            ->findOrFail($validated['inventory_movement_id']);

        Gate::authorize('view', $movement);

        return $this->jsonResource(new InventoryMovementResource($movement));
    }

    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'inventory_movement_id' => $schema->integer()
                ->description('The inventory movement ID.')
                ->required(),
        ];
    }

    protected function permission(): string
    {
        return 'inventory.view';
    }
}
