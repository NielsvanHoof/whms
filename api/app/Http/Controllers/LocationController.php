<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Location\StoreLocationData;
use App\Data\Location\UpdateLocationData;
use App\Http\Resources\LocationResource;
use App\Models\Location;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

final class LocationController extends Controller
{
    /**
     * Display a paginated listing of locations for the current tenant.
     */
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Location::class);

        $locations = QueryBuilder::for(Location::class)
            ->allowedFilters(
                AllowedFilter::exact('warehouse_id'),
                AllowedFilter::exact('type'),
                AllowedFilter::partial('code')
            )
            ->allowedSorts('id', 'warehouse_id', 'code', 'type', 'created_at')
            ->defaultSort('-id')
            ->paginate(request()->input('per_page', 15))
            ->withQueryString();

        return LocationResource::collection($locations);
    }

    /**
     * Store a newly created location.
     */
    public function store(StoreLocationData $data): LocationResource
    {
        $this->authorize('create', Location::class);

        $location = Location::query()->create($data->toModelAttributes());

        return new LocationResource($location->load('warehouse'));
    }

    /**
     * Display the specified location.
     */
    public function show(Location $location): LocationResource
    {
        $this->authorize('view', $location);

        return new LocationResource($location->load('warehouse'));
    }

    /**
     * Update the specified location.
     */
    public function update(UpdateLocationData $data, Location $location): LocationResource
    {
        $this->authorize('update', $location);

        $location->update($data->toModelAttributes());

        return new LocationResource($location->load('warehouse'));
    }

    /**
     * Remove the specified location.
     */
    public function destroy(Location $location): Response
    {
        $this->authorize('delete', $location);
        $location->delete();

        return response()->noContent();
    }
}
