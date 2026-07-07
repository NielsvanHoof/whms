<?php

declare(strict_types=1);

namespace App\Mcp\Tools;

use App\Data\Warehouse\StoreWarehouseData;
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

#[Description('Creates a warehouse for the current tenant. Requires explicit user intent before calling.')]
#[IsDestructive]
final class CreateWarehouseTool extends Tool
{
    use EncodesMcpJson;
    use RegistersForPermission;

    public function handle(Request $request): Response
    {
        Gate::authorize('create', Warehouse::class);

        $data = StoreWarehouseData::validateAndCreate($request->all());

        $warehouse = Warehouse::query()->create($data->toModelAttributes());

        return $this->jsonResource(new WarehouseResource($warehouse));
    }

    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'name' => $schema->string()
                ->description('The warehouse display name.')
                ->required(),
            'code' => $schema->string()
                ->description('Optional unique warehouse code within the tenant.'),
        ];
    }

    protected function permission(): string
    {
        return 'warehouses.manage';
    }
}
