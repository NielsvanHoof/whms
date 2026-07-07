<?php

declare(strict_types=1);

namespace App\Mcp\Tools;

use App\Data\Location\UpdateLocationData;
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

#[Description('Updates a location for the current tenant. Requires explicit user intent before calling.')]
#[IsDestructive]
final class UpdateLocationTool extends Tool
{
    use EncodesMcpJson;
    use RegistersForPermission;

    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'location_id' => ['required', 'integer', 'min:1'],
        ]);

        $location = Location::query()->with('warehouse')->findOrFail($validated['location_id']);

        Gate::authorize('update', $location);

        $data = UpdateLocationData::validateAndCreate([
            ...$request->all(),
            'location_id' => $location->id,
            'warehouse_id' => $request->get('warehouse_id', $location->warehouse_id),
        ]);

        $location->update($data->toModelAttributes());

        return $this->jsonResource(new LocationResource($location->fresh()->load('warehouse')));
    }

    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'location_id' => $schema->integer()
                ->description('The location ID to update.')
                ->required(),
            'warehouse_id' => $schema->integer()->description('Move the location to another warehouse.'),
            'code' => $schema->string()->description('Updated location code.'),
            'type' => $schema->string()->description('Updated location type.'),
        ];
    }

    protected function permission(): string
    {
        return 'locations.manage';
    }
}
