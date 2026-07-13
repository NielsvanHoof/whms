<?php

declare(strict_types=1);

namespace App\Data\Inventory;

use App\Models\Tenant;
use Illuminate\Validation\Rule;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

final class StoreReorderPointData extends Data
{
    public function __construct(
        public int $product_id,
        public int $location_id,
        public int $quantity,
    ) {}

    /**
     * @return array<string, array<int, mixed>>
     */
    public static function rules(?ValidationContext $context = null): array
    {
        $tenantId = Tenant::current()?->getKey();

        return [
            'product_id' => [
                'required',
                'integer',
                Rule::exists('products', 'id')->where(
                    fn ($query) => $query->where('tenant_id', $tenantId)
                ),
            ],
            'location_id' => [
                'required',
                'integer',
                Rule::exists('locations', 'id')->where(
                    fn ($query) => $query->where('tenant_id', $tenantId)
                ),
                Rule::unique('reorder_points', 'location_id')
                    ->where(fn ($query) => $query
                        ->where('tenant_id', $tenantId)
                        ->where('product_id', $context?->fullPayload['product_id'] ?? 0)),
            ],
            'quantity' => ['required', 'integer', 'min:0'],
        ];
    }

    /**
     * @return array{product_id: int, location_id: int, quantity: int}
     */
    public function toModelAttributes(): array
    {
        return [
            'product_id' => $this->product_id,
            'location_id' => $this->location_id,
            'quantity' => $this->quantity,
        ];
    }
}
