<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Warehouse\StoreWarehouseData;
use App\Data\Warehouse\UpdateWarehouseData;
use App\Http\Resources\WarehouseResource;
use App\Models\Warehouse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

final class WarehouseController extends Controller
{
    /**
     * Display a paginated listing of warehouses for the current tenant.
     */
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Warehouse::class);

        $warehouses = QueryBuilder::for(Warehouse::class)
            ->allowedFilters(
                AllowedFilter::partial('name'),
                AllowedFilter::exact('code'),
            )
            ->allowedSorts('id', 'name', 'code', 'created_at')
            ->defaultSort('-id')
            ->paginate(request()->input('per_page', 15))
            ->withQueryString();

        return WarehouseResource::collection($warehouses);
    }

    /**
     * Store a newly created warehouse.
     */
    public function store(StoreWarehouseData $data): WarehouseResource
    {
        $this->authorize('create', Warehouse::class);

        $warehouse = Warehouse::query()->create($data->toModelAttributes());

        return new WarehouseResource($warehouse);
    }

    /**
     * Display the specified warehouse.
     */
    public function show(Warehouse $warehouse): WarehouseResource
    {
        $this->authorize('view', $warehouse);

        return new WarehouseResource($warehouse);
    }

    /**
     * Update the specified warehouse.
     */
    public function update(UpdateWarehouseData $data, Warehouse $warehouse): WarehouseResource
    {
        $this->authorize('update', $warehouse);

        $warehouse->update($data->toModelAttributes());

        return new WarehouseResource($warehouse);
    }

    /**
     * Remove the specified warehouse.
     */
    public function destroy(Warehouse $warehouse): Response
    {
        $this->authorize('delete', $warehouse);
        $warehouse->delete();

        return response()->noContent();
    }
}
