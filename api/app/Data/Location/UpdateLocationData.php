<?php

namespace App\Data\Location;

use App\Models\Tenant;
use Illuminate\Validation\Rule;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class UpdateLocationData extends Data
{
    public function __construct(
        public int|Optional $warehouse_id,
        public string|Optional $code,
        public string|Optional $type,
        public int $location_id,
    ) {}

    /**
     * @return array<string, array<int, (\Closure(string):void)|string>>
     */
    public static function rules(?ValidationContext $context = null): array
    {
        $tenantId = Tenant::current()?->getKey();
        $locationId = (int) ($context?->fullPayload["location_id"] ?? 0);
        $warehouseId = (int) ($context?->fullPayload["warehouse_id"] ?? 0);

        return [
            "warehouse_id" => [
                "sometimes",
                "integer",
                Rule::exists("warehouses", "id")->where(
                    fn ($query) => $query->where("tenant_id", $tenantId)
                ),
            ],
            "code" => [
                "sometimes",
                "string",
                "max:64",
                Rule::unique("locations", "code")
                    ->where(fn ($query) => $query
                        ->where("tenant_id", $tenantId)
                        ->where("warehouse_id", $warehouseId))
                    ->ignore($locationId),
            ],
            "type" => ["sometimes", "string", "max:32"],
            "location_id" => ["required", "integer"],
        ];
    }

    /**
     * @return array{warehouse_id?: int, code?: string, type?: string}
     */
    public function toModelAttributes(): array
    {
        $attributes = [];

        if (! $this->warehouse_id instanceof Optional) {
            $attributes["warehouse_id"] = $this->warehouse_id;
        }

        if (! $this->code instanceof Optional) {
            $attributes["code"] = $this->code;
        }

        if (! $this->type instanceof Optional) {
            $attributes["type"] = $this->type;
        }

        return $attributes;
    }
}