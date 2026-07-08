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
            ->allowedFilters(
                AllowedFilter::exact('warehouse_id'),
                AllowedFilter::exact('location_id'),
                AllowedFilter::exact('product_id'),
                AllowedFilter::exact('kind'),
                AllowedFilter::exact('transfer_correlation_id'),
            )
            ->allowedSorts('id', 'created_at')
            ->defaultSort('-id')
            ->with(['warehouse', 'location', 'product'])
            ->paginate(request()->input('per_page', 15))
            ->withQueryString();

        return InventoryMovementResource::collection($movements);
    }

    /**
     * Single movement row including related warehouse, location, and product.
     */
    public function show(InventoryMovement $inventoryMovement): InventoryMovementResource
    {
        $this->authorize('view', $inventoryMovement);

        $inventoryMovement->load(['warehouse', 'location', 'product']);

        return new InventoryMovementResource($inventoryMovement);
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
