<?php

declare(strict_types=1);

namespace App\Mcp\Tools;

use App\Data\Location\StoreLocationData;
use App\Http\Resources\LocationResource;
use App\Mcp\Concerns\EncodesMcpJson;
use App\Mcp\Concerns\RegistersForPermission;
use App\Models\Location;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Gate;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsDestructive;

#[Description('Creates a location within a warehouse for the current tenant. Requires explicit user intent before calling.')]
#[IsDestructive]
final class CreateLocationTool extends Tool
{
    use EncodesMcpJson;
    use RegistersForPermission;

    public function handle(Request $request): Response
    {
        Gate::authorize('create', Location::class);

        $data = StoreLocationData::validateAndCreate($request->all());

        $location = Location::query()->create($data->toModelAttributes());

        return $this->jsonResource(new LocationResource($location->load('warehouse')));
    }

    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'warehouse_id' => $schema->integer()
                ->description('The warehouse that owns this location.')
                ->required(),
            'code' => $schema->string()
                ->description('Unique location code within the warehouse.')
                ->required(),
            'type' => $schema->string()
                ->description('Location type (e.g. bin, aisle, staging).')
                ->required(),
        ];
    }

    protected function permission(): string
    {
        return 'locations.manage';
    }
}
