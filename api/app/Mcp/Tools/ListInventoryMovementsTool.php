<?php

declare(strict_types=1);

namespace App\Mcp\Tools;

use App\Http\Resources\InventoryMovementResource;
use App\Mcp\Concerns\CapsMcpPagination;
use App\Mcp\Concerns\EncodesMcpJson;
use App\Mcp\Concerns\RegistersForPermission;
use App\Models\InventoryMovement;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Gate;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Description('Lists inventory movement ledger rows for the current tenant with optional filters and pagination.')]
#[IsReadOnly]
final class ListInventoryMovementsTool extends Tool
{
    use CapsMcpPagination;
    use EncodesMcpJson;
    use RegistersForPermission;

    public function handle(Request $request): Response
    {
        Gate::authorize('viewAny', InventoryMovement::class);

        $query = InventoryMovement::query()->with(['warehouse', 'location', 'product']);

        if ($request->get('warehouse_id') !== null) {
            $query->where('warehouse_id', (int) $request->get('warehouse_id'));
        }

        if ($request->get('location_id') !== null) {
            $query->where('location_id', (int) $request->get('location_id'));
        }

        if ($request->get('product_id') !== null) {
            $query->where('product_id', (int) $request->get('product_id'));
        }

        if ($request->get('kind') !== null) {
            $query->where('kind', $request->string('kind'));
        }

        if ($request->get('transfer_correlation_id') !== null) {
            $query->where('transfer_correlation_id', $request->string('transfer_correlation_id'));
        }

        $sort = $request->string('sort', '-id')->toString();
        $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $column = mb_ltrim($sort, '-');
        $allowedSorts = ['id', 'created_at'];

        if (in_array($column, $allowedSorts, true)) {
            $query->orderBy($column, $direction);
        } else {
            $query->orderByDesc('id');
        }

        $paginator = $query->paginate(
            perPage: $this->cappedPerPage($request),
            page: $this->cappedPage($request),
        );

        return $this->jsonPaginatedResource($paginator, InventoryMovementResource::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            ...$this->paginationSchema($schema),
            'warehouse_id' => $schema->integer()->description('Filter by warehouse ID.'),
            'location_id' => $schema->integer()->description('Filter by location ID.'),
            'product_id' => $schema->integer()->description('Filter by product ID.'),
            'kind' => $schema->string()->description('Filter by movement kind: receipt, adjustment, or transfer.'),
            'transfer_correlation_id' => $schema->string()->description('Filter transfer rows by correlation ID.'),
            'sort' => $schema->string()
                ->description('Sort field. Prefix with - for descending.')
                ->default('-id'),
        ];
    }

    protected function permission(): string
    {
        return 'inventory.view';
    }
}
