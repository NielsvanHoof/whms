<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Inventory\StoreInventoryMovementData;
use App\Http\Resources\InventoryMovementResource;
use App\Models\InventoryMovement;
use App\Services\ApplyInventoryMovementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

final class InventoryMovementController extends Controller
{
    /**
     * Audit trail of stock changes for the current tenant.
     */
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', InventoryMovement::class);

        $movements = QueryBuilder::for(InventoryMovement::class)
            ->with(['warehouse', 'location', 'product'])
            ->allowedFilters(
                AllowedFilter::exact('warehouse_id'),
                AllowedFilter::exact('location_id'),
                AllowedFilter::exact('product_id'),
                AllowedFilter::exact('kind'),
                AllowedFilter::exact('transfer_correlation_id'),
            )
            ->allowedSorts('id', 'created_at')
            ->defaultSort('-id')
            ->paginate(15)
            ->withQueryString();

        return InventoryMovementResource::collection($movements);
    }

    /**
     * Applies a receipt, adjustment, or transfer and returns the created ledger row(s).
     */
    public function store(
        StoreInventoryMovementData $data,
        ApplyInventoryMovementService $service,
        Request $request,
    ): JsonResponse {
        $this->authorize('create', InventoryMovement::class);

        $movements = $service->apply($data, $request->user());

        return InventoryMovementResource::collection(collect($movements))
            ->response()
            ->setStatusCode(201);
    }
}
