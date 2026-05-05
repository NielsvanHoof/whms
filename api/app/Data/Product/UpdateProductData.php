<?php

namespace App\Data\Product;

use App\Models\Tenant;
use Illuminate\Validation\Rule;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class UpdateProductData extends Data
{
    public function __construct(
        public string|Optional $sku,
        public string|Optional $name,
        public string|Optional $unit,
        public bool|Optional $is_active,
        public int $product_id,
    ) {}

    /**
     * @return array<string, array<int, (\Closure(string):void)|string>>
     */
    public static function rules(?ValidationContext $context = null): array
    {
        $tenantId = Tenant::current()?->getKey();
        $productId = (int) ($context?->fullPayload["product_id"] ?? 0);

        return [
            "sku" => [
                "sometimes",
                "string",
                "max:64",
                Rule::unique("products", "sku")
                    ->where(fn ($query) => $query->where("tenant_id", $tenantId))
                    ->ignore($productId),
            ],
            "name" => ["sometimes", "string", "max:255"],
            "unit" => ["sometimes", "string", "max:32"],
            "is_active" => ["sometimes", "boolean"],
            "product_id" => ["required", "integer"],
        ];
    }

    /**
     * @return array{sku?: string, name?: string, unit?: string, is_active?: bool}
     */
    public function toModelAttributes(): array
    {
        $attributes = [];

        if (! $this->sku instanceof Optional) {
            $attributes["sku"] = $this->sku;
        }

        if (! $this->name instanceof Optional) {
            $attributes["name"] = $this->name;
        }

        if (! $this->unit instanceof Optional) {
            $attributes["unit"] = $this->unit;
        }

        if (! $this->is_active instanceof Optional) {
            $attributes["is_active"] = $this->is_active;
        }

        return $attributes;
    }
}