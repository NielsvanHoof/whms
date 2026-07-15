<?php

declare(strict_types=1);

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Resources\LowStockResource;
use App\Models\ReorderPoint;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

final class LowStockController extends Controller
{
    /**
     * Reorder points whose current on-hand quantity has dropped to or below their threshold.
     */
    public function __invoke(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', ReorderPoint::class);

        $perPage = min(
            max(request()->integer('per_page', 15), 1),
            100
        );

        $lowStock = QueryBuilder::for(ReorderPoint::class)
            ->allowedFilters(
                AllowedFilter::exact('product_id', 'reorder_points.product_id'),
                AllowedFilter::exact('location_id', 'reorder_points.location_id'),
            )
            ->allowedSorts('id', 'quantity')
            ->defaultSort('-id')
            ->select('reorder_points.*')
            ->selectRaw('coalesce(inventory_balances.quantity, 0) as on_hand_quantity')
            ->leftJoin('inventory_balances', function ($join) {
                $join->on('inventory_balances.product_id', '=', 'reorder_points.product_id')
                    ->on('inventory_balances.location_id', '=', 'reorder_points.location_id');
            })
            ->whereRaw('coalesce(inventory_balances.quantity, 0) <= reorder_points.quantity')
            ->with(['product', 'location.warehouse'])
            ->paginate($perPage)
            ->withQueryString();

        return LowStockResource::collection($lowStock);
    }
}
