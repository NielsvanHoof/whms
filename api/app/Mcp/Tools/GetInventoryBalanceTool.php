<?php

declare(strict_types=1);

namespace App\Mcp\Tools;

use App\Http\Resources\InventoryBalanceResource;
use App\Mcp\Concerns\EncodesMcpJson;
use App\Mcp\Concerns\RegistersForPermission;
use App\Models\InventoryBalance;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Gate;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Description('Returns a single inventory balance row by ID for the current tenant.')]
#[IsReadOnly]
final class GetInventoryBalanceTool extends Tool
{
    use EncodesMcpJson;
    use RegistersForPermission;

    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'inventory_balance_id' => ['required', 'integer', 'min:1'],
        ]);

        $balance = InventoryBalance::query()
            ->with(['warehouse', 'location', 'product'])
            ->findOrFail($validated['inventory_balance_id']);

        Gate::authorize('view', $balance);

        return $this->jsonResource(new InventoryBalanceResource($balance));
    }

    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'inventory_balance_id' => $schema->integer()
                ->description('The inventory balance ID.')
                ->required(),
        ];
    }

    protected function permission(): string
    {
        return 'inventory.view';
    }
}
