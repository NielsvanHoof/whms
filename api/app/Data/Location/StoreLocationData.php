<?php

namespace App\Data\Location;

use App\Models\Tenant;
use Illuminate\Validation\Rule;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class StoreLocationData extends Data
{
    public function __construct(
        public int $warehouse_id,
        public string $code,
        public string $type,
    ) {}

    /**
     * @return array<string, array<int, (\Closure(string):void)|string>>
     */
    public static function rules(?ValidationContext $context = null): array
    {
        $tenantId = Tenant::current()?->getKey();

        return [
            "warehouse_id" => [
                "required",
                "integer",
                Rule::exists("warehouses", "id")->where(
                    fn ($query) => $query->where("tenant_id", $tenantId)
                ),
            ],
            "code" => [
                "required",
                "string",
                "max:64",
                Rule::unique("locations", "code")
                    ->where(fn ($query) => $query
                        ->where("tenant_id", $tenantId)
                        ->where("warehouse_id", $context?->fullPayload["warehouse_id"] ?? 0)),
            ],
            "type" => ["required", "string", "max:32"],
        ];
    }

    /**
     * @return array{warehouse_id: int, code: string, type: string}
     */
    public function toModelAttributes(): array
    {
        return [
            "warehouse_id" => $this->warehouse_id,
            "code" => $this->code,
            "type" => $this->type,
        ];
    }
}