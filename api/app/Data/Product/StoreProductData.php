<?php

namespace App\Data\Product;

use App\Models\Tenant;
use Illuminate\Validation\Rule;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class StoreProductData extends Data
{
    public function __construct(
        public string $sku,
        public string $name,
        public string $unit,
        public bool $is_active,
    ) {}

    /**
     * @return array<string, array<int, (\Closure(string):void)|string>>
     */
    public static function rules(?ValidationContext $context = null): array
    {
        $tenantId = Tenant::current()?->getKey();

        return [
            "sku" => [
                "required",
                "string",
                "max:64",
                Rule::unique("products", "sku")->where(
                    fn ($query) => $query->where("tenant_id", $tenantId)
                ),
            ],
            "name" => ["required", "string", "max:255"],
            "unit" => ["required", "string", "max:32"],
            "is_active" => ["required", "boolean"],
        ];
    }

    /**
     * @return array{sku: string, name: string, unit: string, is_active: bool}
     */
    public function toModelAttributes(): array
    {
        return [
            "sku" => $this->sku,
            "name" => $this->name,
            "unit" => $this->unit,
            "is_active" => $this->is_active,
        ];
    }
}