<?php

declare(strict_types=1);

namespace App\Data\Inventory;

use App\Enums\InventoryMovementKind;
use Illuminate\Validation\Rule;
use Spatie\LaravelData\Support\Validation\ValidationContext;

final class ReceiptInventoryMovementData extends StoreInventoryMovementData
{
    public function __construct(
        public int $location_id,
        public int $product_id,
        public int $quantity,
    ) {}

    /**
     * @return array<string, array<int, mixed>>
     */
    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'kind' => ['required', Rule::enum(InventoryMovementKind::class)],
            'location_id' => ['required', 'integer', self::tenantLocationExistsRule()],
            'product_id' => ['required', 'integer', self::tenantProductExistsRule()],
            'quantity' => ['required', 'integer', 'min:1'],
        ];
    }
}
