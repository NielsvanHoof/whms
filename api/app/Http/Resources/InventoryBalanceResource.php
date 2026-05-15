<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\InventoryBalance;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin InventoryBalance
 */
final class InventoryBalanceResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tenant_id' => $this->tenant_id,
            'warehouse_id' => $this->warehouse_id,
            'location_id' => $this->location_id,
            'product_id' => $this->product_id,
            'quantity' => (int) $this->quantity,
            'warehouse' => WarehouseResource::make($this->whenLoaded('warehouse')),
            'location' => LocationResource::make($this->whenLoaded('location')),
            'product' => ProductResource::make($this->whenLoaded('product')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
