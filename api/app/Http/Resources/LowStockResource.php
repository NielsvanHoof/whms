<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\ReorderPoint;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A reorder point whose current on-hand quantity has dropped to or below its threshold.
 *
 * @mixin ReorderPoint
 */
final class LowStockResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $onHandQuantity = (int) $this->resource->getAttribute('on_hand_quantity');
        $quantity = (int) $this->quantity;
        $shortfall = $quantity - $onHandQuantity;
        $shortage = $shortfall > 0 ? $shortfall : 0;

        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'location_id' => $this->location_id,
            'quantity' => $quantity,
            'on_hand_quantity' => $onHandQuantity,
            'shortage' => (int) $shortage,
            'product' => ProductResource::make($this->whenLoaded('product')),
            'location' => LocationResource::make($this->whenLoaded('location')),
        ];
    }
}
