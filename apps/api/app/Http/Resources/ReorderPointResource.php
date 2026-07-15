<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\ReorderPoint;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ReorderPoint
 */
final class ReorderPointResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tenant_id' => $this->tenant_id,
            'product_id' => $this->product_id,
            'location_id' => $this->location_id,
            'quantity' => (int) $this->quantity,
            'product' => ProductResource::make($this->whenLoaded('product')),
            'location' => LocationResource::make($this->whenLoaded('location')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
