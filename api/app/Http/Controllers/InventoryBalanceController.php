<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Resources\InventoryBalanceResource;
use App\Models\InventoryBalance;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

final class InventoryBalanceController extends Controller
{
    /**
     * Paginated balances for the current tenant (per location and product).
     */
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', InventoryBalance::class);

        $balances = QueryBuilder::for(InventoryBalance::class)
            ->with(['warehouse', 'location', 'product'])
            ->allowedFilters(
                AllowedFilter::exact('warehouse_id'),
                AllowedFilter::exact('location_id'),
                AllowedFilter::exact('product_id'),
            )
            ->allowedSorts('id', 'quantity', 'created_at', 'updated_at')
            ->defaultSort('-id')
            ->paginate(15)
            ->withQueryString();

        return InventoryBalanceResource::collection($balances);
    }

    /**
     * Single balance row including related warehouse, location, and product.
     */
    public function show(InventoryBalance $inventoryBalance): InventoryBalanceResource
    {
        $this->authorize('view', $inventoryBalance);

        $inventoryBalance->load(['warehouse', 'location', 'product']);

        return new InventoryBalanceResource($inventoryBalance);
    }
}
