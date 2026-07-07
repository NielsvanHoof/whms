<?php

declare(strict_types=1);

namespace App\Mcp\Tools;

use App\Http\Resources\WarehouseResource;
use App\Mcp\Concerns\CapsMcpPagination;
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

#[Description('Lists warehouses for the current tenant with optional name/code filters and pagination.')]
#[IsReadOnly]
final class ListWarehousesTool extends Tool
{
    use CapsMcpPagination;
    use EncodesMcpJson;
    use RegistersForPermission;

    public function handle(Request $request): Response
    {
        Gate::authorize('viewAny', Warehouse::class);

        $query = Warehouse::query();

        if ($request->get('name') !== null) {
            $query->where('name', 'like', '%'.$request->string('name').'%');
        }

        if ($request->get('code') !== null) {
            $query->where('code', $request->string('code'));
        }

        $sort = $request->string('sort', '-id')->toString();
        $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $column = mb_ltrim($sort, '-');
        $allowedSorts = ['id', 'name', 'code', 'created_at'];

        if (in_array($column, $allowedSorts, true)) {
            $query->orderBy($column, $direction);
        } else {
            $query->orderByDesc('id');
        }

        $paginator = $query->paginate(
            perPage: $this->cappedPerPage($request),
            page: $this->cappedPage($request),
        );

        return $this->jsonPaginatedResource($paginator, WarehouseResource::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            ...$this->paginationSchema($schema),
            'name' => $schema->string()->description('Filter by partial warehouse name.'),
            'code' => $schema->string()->description('Filter by exact warehouse code.'),
            'sort' => $schema->string()
                ->description('Sort field. Prefix with - for descending (e.g. -name).')
                ->default('-id'),
        ];
    }

    protected function permission(): string
    {
        return 'warehouses.view';
    }
}
