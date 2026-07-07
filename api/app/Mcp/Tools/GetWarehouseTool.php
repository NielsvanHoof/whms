<?php

declare(strict_types=1);

namespace App\Mcp\Tools;

use App\Http\Resources\WarehouseResource;
use App\Mcp\Concerns\EncodesMcpJson;
use App\Mcp\Concerns\RegistersForPermission;
use App\Models\Warehouse;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Gate;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Description('Returns a single warehouse by ID for the current tenant.')]
#[IsReadOnly]
final class GetWarehouseTool extends Tool
{
    use EncodesMcpJson;
    use RegistersForPermission;

    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'warehouse_id' => ['required', 'integer', 'min:1'],
        ]);

        $warehouse = Warehouse::query()->findOrFail($validated['warehouse_id']);

        Gate::authorize('view', $warehouse);

        return $this->jsonResource(new WarehouseResource($warehouse));
    }

    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'warehouse_id' => $schema->integer()
                ->description('The warehouse ID.')
                ->required(),
        ];
    }

    protected function permission(): string
    {
        return 'warehouses.view';
    }
}
