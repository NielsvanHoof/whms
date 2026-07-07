<?php

declare(strict_types=1);

namespace App\Mcp\Tools;

use App\Data\Warehouse\UpdateWarehouseData;
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
use Laravel\Mcp\Server\Tools\Annotations\IsDestructive;

#[Description('Updates a warehouse for the current tenant. Requires explicit user intent before calling.')]
#[IsDestructive]
final class UpdateWarehouseTool extends Tool
{
    use EncodesMcpJson;
    use RegistersForPermission;

    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'warehouse_id' => ['required', 'integer', 'min:1'],
        ]);

        $warehouse = Warehouse::query()->findOrFail($validated['warehouse_id']);

        Gate::authorize('update', $warehouse);

        $data = UpdateWarehouseData::validateAndCreate([
            ...$request->all(),
            'warehouse_id' => $warehouse->id,
        ]);

        $warehouse->update($data->toModelAttributes());

        return $this->jsonResource(new WarehouseResource($warehouse->fresh()));
    }

    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'warehouse_id' => $schema->integer()
                ->description('The warehouse ID to update.')
                ->required(),
            'name' => $schema->string()->description('Updated warehouse name.'),
            'code' => $schema->string()->description('Updated warehouse code.'),
        ];
    }

    protected function permission(): string
    {
        return 'warehouses.manage';
    }
}
