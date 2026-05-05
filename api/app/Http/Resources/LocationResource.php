<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Location
 */
class LocationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            "id" => $this->id,
            "tenant_id" => $this->tenant_id,
            "warehouse_id" => $this->warehouse_id,
            "warehouse_code" => $this->whenLoaded("warehouse", fn (): ?string => $this->warehouse?->code),
            "code" => $this->code,
            "type" => $this->type,
            "created_at" => $this->created_at?->toIso8601String(),
            "updated_at" => $this->updated_at?->toIso8601String(),
        ];
    }
}