<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\InventoryMovement;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin InventoryMovement
 */
final class InventoryMovementResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tenant_id' => $this->tenant_id,
            'kind' => $this->kind,
            'warehouse_id' => $this->warehouse_id,
            'location_id' => $this->location_id,
            'product_id' => $this->product_id,
            'quantity_delta' => (int) $this->quantity_delta,
            'transfer_correlation_id' => $this->transfer_correlation_id,
            'user_id' => $this->user_id,
            'warehouse' => WarehouseResource::make($this->whenLoaded('warehouse')),
            'location' => LocationResource::make($this->whenLoaded('location')),
            'product' => ProductResource::make($this->whenLoaded('product')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
