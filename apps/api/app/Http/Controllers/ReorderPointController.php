<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Inventory\StoreReorderPointData;
use App\Data\Inventory\UpdateReorderPointData;
use App\Http\Resources\ReorderPointResource;
use App\Models\ReorderPoint;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

final class ReorderPointController extends Controller
{
    /**
     * Display a paginated listing of reorder points for the current tenant.
     */
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', ReorderPoint::class);

        $perPage = min(
            max(request()->integer('per_page', 15), 1),
            100
        );

        $reorderPoints = QueryBuilder::for(ReorderPoint::class)
            ->allowedFilters(
                AllowedFilter::exact('product_id'),
                AllowedFilter::exact('location_id'),
            )
            ->allowedSorts('id', 'quantity', 'created_at')
            ->defaultSort('-id')
            ->with(['product', 'location'])
            ->paginate($perPage)
            ->withQueryString();

        return ReorderPointResource::collection($reorderPoints);
    }

    /**
     * Store a newly created reorder point.
     */
    public function store(StoreReorderPointData $data): ReorderPointResource
    {
        $this->authorize('create', ReorderPoint::class);

        $reorderPoint = ReorderPoint::query()->create($data->toModelAttributes());

        return new ReorderPointResource($reorderPoint->load(['product', 'location']));
    }

    /**
     * Display the specified reorder point.
     */
    public function show(ReorderPoint $reorderPoint): ReorderPointResource
    {
        $this->authorize('view', $reorderPoint);

        return new ReorderPointResource($reorderPoint->load(['product', 'location']));
    }

    /**
     * Update the specified reorder point's threshold quantity.
     */
    public function update(UpdateReorderPointData $data, ReorderPoint $reorderPoint): ReorderPointResource
    {
        $this->authorize('update', $reorderPoint);

        $reorderPoint->update($data->toModelAttributes());

        return new ReorderPointResource($reorderPoint->load(['product', 'location']));
    }

    /**
     * Remove the specified reorder point.
     */
    public function destroy(ReorderPoint $reorderPoint): Response
    {
        $this->authorize('delete', $reorderPoint);
        $reorderPoint->delete();

        return response()->noContent();
    }
}
