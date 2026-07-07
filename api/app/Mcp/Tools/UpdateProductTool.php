<?php

declare(strict_types=1);

namespace App\Mcp\Tools;

use App\Data\Product\UpdateProductData;
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

#[Description('Updates a product for the current tenant. Requires explicit user intent before calling.')]
#[IsDestructive]
final class UpdateProductTool extends Tool
{
    use EncodesMcpJson;
    use RegistersForPermission;

    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'min:1'],
        ]);

        $product = Product::query()->findOrFail($validated['product_id']);

        Gate::authorize('update', $product);

        $data = UpdateProductData::validateAndCreate([
            ...$request->all(),
            'product_id' => $product->id,
        ]);

        $product->update($data->toModelAttributes());

        return $this->jsonResource(new ProductResource($product->fresh()));
    }

    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'product_id' => $schema->integer()
                ->description('The product ID to update.')
                ->required(),
            'sku' => $schema->string()->description('Updated SKU.'),
            'name' => $schema->string()->description('Updated product name.'),
            'unit' => $schema->string()->description('Updated unit of measure.'),
            'is_active' => $schema->boolean()->description('Updated active status.'),
        ];
    }

    protected function permission(): string
    {
        return 'products.manage';
    }
}
