<?php

declare(strict_types=1);

namespace App\Mcp\Tools;

use App\Data\Product\StoreProductData;
use App\Http\Resources\ProductResource;
use App\Mcp\Concerns\EncodesMcpJson;
use App\Mcp\Concerns\RegistersForPermission;
use App\Models\Product;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Gate;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsDestructive;

#[Description('Creates a product for the current tenant. Requires explicit user intent before calling.')]
#[IsDestructive]
final class CreateProductTool extends Tool
{
    use EncodesMcpJson;
    use RegistersForPermission;

    public function handle(Request $request): Response
    {
        Gate::authorize('create', Product::class);

        $data = StoreProductData::validateAndCreate($request->all());

        $product = Product::query()->create($data->toModelAttributes());

        return $this->jsonResource(new ProductResource($product));
    }

    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'sku' => $schema->string()
                ->description('Unique product SKU within the tenant.')
                ->required(),
            'name' => $schema->string()
                ->description('Product display name.')
                ->required(),
            'unit' => $schema->string()
                ->description('Unit of measure (e.g. ea, kg).')
                ->required(),
            'is_active' => $schema->boolean()
                ->description('Whether the product is active.')
                ->default(true),
        ];
    }

    protected function permission(): string
    {
        return 'products.manage';
    }
}
