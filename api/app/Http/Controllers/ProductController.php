<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Product\StoreProductData;
use App\Data\Product\UpdateProductData;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

final class ProductController extends Controller
{
    /**
     * Display a paginated listing of products for the current tenant.
     */
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Product::class);

        $products = QueryBuilder::for(Product::class)
            ->allowedFilters(
                AllowedFilter::partial('name'),
                AllowedFilter::exact('sku'),
                AllowedFilter::exact('unit'),
                AllowedFilter::exact('is_active')
            )
            ->allowedSorts('id', 'sku', 'name', 'unit', 'is_active', 'created_at')
            ->defaultSort('-id')
            ->paginate(request()->input('per_page', 15))
            ->withQueryString();

        return ProductResource::collection($products);
    }

    /**
     * Store a newly created product.
     */
    public function store(StoreProductData $data): ProductResource
    {
        $this->authorize('create', Product::class);

        $product = Product::query()->create($data->toModelAttributes());

        return new ProductResource($product);
    }

    /**
     * Display the specified product.
     */
    public function show(Product $product): ProductResource
    {
        $this->authorize('view', $product);

        return new ProductResource($product);
    }

    /**
     * Update the specified product.
     */
    public function update(UpdateProductData $data, Product $product): ProductResource
    {
        $this->authorize('update', $product);

        $product->update($data->toModelAttributes());

        return new ProductResource($product);
    }

    /**
     * Remove the specified product.
     */
    public function destroy(Product $product): Response
    {
        $this->authorize('delete', $product);
        $product->delete();

        return response()->noContent();
    }
}
