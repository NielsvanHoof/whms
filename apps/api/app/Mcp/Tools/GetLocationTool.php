<?php

declare(strict_types=1);

namespace App\Mcp\Tools;

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
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Description('Returns a single location by ID for the current tenant.')]
#[IsReadOnly]
final class GetLocationTool extends Tool
{
    use EncodesMcpJson;
    use RegistersForPermission;

    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'location_id' => ['required', 'integer', 'min:1'],
        ]);

        $location = Location::query()->with('warehouse')->findOrFail($validated['location_id']);

        Gate::authorize('view', $location);

        return $this->jsonResource(new LocationResource($location));
    }

    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'location_id' => $schema->integer()
                ->description('The location ID.')
                ->required(),
        ];
    }

    protected function permission(): string
    {
        return 'locations.view';
    }
}
