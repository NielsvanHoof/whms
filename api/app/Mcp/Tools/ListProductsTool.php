<?php

declare(strict_types=1);

namespace App\Mcp\Tools;

use App\Http\Resources\ProductResource;
use App\Mcp\Concerns\CapsMcpPagination;
use App\Mcp\Concerns\EncodesMcpJson;
use App\Mcp\Concerns\RegistersForPermission;
use App\Models\Product;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Gate;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Description('Lists products for the current tenant with optional filters and pagination.')]
#[IsReadOnly]
final class ListProductsTool extends Tool
{
    use CapsMcpPagination;
    use EncodesMcpJson;
    use RegistersForPermission;

    public function handle(Request $request): Response
    {
        Gate::authorize('viewAny', Product::class);

        $query = Product::query();

        if ($request->get('name') !== null) {
            $query->where('name', 'like', '%'.$request->string('name').'%');
        }

        if ($request->get('sku') !== null) {
            $query->where('sku', $request->string('sku'));
        }

        if ($request->get('unit') !== null) {
            $query->where('unit', $request->string('unit'));
        }

        if ($request->get('is_active') !== null) {
            $query->where('is_active', filter_var($request->get('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $sort = $request->string('sort', '-id')->toString();
        $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $column = mb_ltrim($sort, '-');
        $allowedSorts = ['id', 'sku', 'name', 'unit', 'is_active', 'created_at'];

        if (in_array($column, $allowedSorts, true)) {
            $query->orderBy($column, $direction);
        } else {
            $query->orderByDesc('id');
        }

        $paginator = $query->paginate(
            perPage: $this->cappedPerPage($request),
            page: $this->cappedPage($request),
        );

        return $this->jsonPaginatedResource($paginator, ProductResource::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            ...$this->paginationSchema($schema),
            'name' => $schema->string()->description('Filter by partial product name.'),
            'sku' => $schema->string()->description('Filter by exact SKU.'),
            'unit' => $schema->string()->description('Filter by unit of measure.'),
            'is_active' => $schema->boolean()->description('Filter by active status.'),
            'sort' => $schema->string()
                ->description('Sort field. Prefix with - for descending.')
                ->default('-id'),
        ];
    }

    protected function permission(): string
    {
        return 'products.view';
    }
}
