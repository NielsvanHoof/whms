<?php

declare(strict_types=1);

namespace App\Mcp\Tools;

use App\Http\Resources\LocationResource;
use App\Mcp\Concerns\CapsMcpPagination;
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

#[Description('Lists locations for the current tenant with optional filters and pagination.')]
#[IsReadOnly]
final class ListLocationsTool extends Tool
{
    use CapsMcpPagination;
    use EncodesMcpJson;
    use RegistersForPermission;

    public function handle(Request $request): Response
    {
        Gate::authorize('viewAny', Location::class);

        $query = Location::query()->with('warehouse');

        if ($request->get('warehouse_id') !== null) {
            $query->where('warehouse_id', (int) $request->get('warehouse_id'));
        }

        if ($request->get('type') !== null) {
            $query->where('type', $request->string('type'));
        }

        if ($request->get('code') !== null) {
            $query->where('code', 'like', '%'.$request->string('code').'%');
        }

        $sort = $request->string('sort', '-id')->toString();
        $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $column = mb_ltrim($sort, '-');
        $allowedSorts = ['id', 'warehouse_id', 'code', 'type', 'created_at'];

        if (in_array($column, $allowedSorts, true)) {
            $query->orderBy($column, $direction);
        } else {
            $query->orderByDesc('id');
        }

        $paginator = $query->paginate(
            perPage: $this->cappedPerPage($request),
            page: $this->cappedPage($request),
        );

        return $this->jsonPaginatedResource($paginator, LocationResource::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            ...$this->paginationSchema($schema),
            'warehouse_id' => $schema->integer()->description('Filter by warehouse ID.'),
            'type' => $schema->string()->description('Filter by location type.'),
            'code' => $schema->string()->description('Filter by partial location code.'),
            'sort' => $schema->string()
                ->description('Sort field. Prefix with - for descending.')
                ->default('-id'),
        ];
    }

    protected function permission(): string
    {
        return 'locations.view';
    }
}
