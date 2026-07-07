<?php

declare(strict_types=1);

namespace App\Mcp\Tools;

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
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Description('Returns a single product by ID for the current tenant.')]
#[IsReadOnly]
final class GetProductTool extends Tool
{
    use EncodesMcpJson;
    use RegistersForPermission;

    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'min:1'],
        ]);

        $product = Product::query()->findOrFail($validated['product_id']);

        Gate::authorize('view', $product);

        return $this->jsonResource(new ProductResource($product));
    }

    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'product_id' => $schema->integer()
                ->description('The product ID.')
                ->required(),
        ];
    }

    protected function permission(): string
    {
        return 'products.view';
    }
}
