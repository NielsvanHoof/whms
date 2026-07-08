<?php

declare(strict_types=1);

namespace App\Data\Inventory;

use App\Data\Inventory\Concerns\ResolvesTenantInventoryValidationRules;
use App\Enums\InventoryMovementKind;
use Spatie\LaravelData\Attributes\PropertyForMorph;
use Spatie\LaravelData\Contracts\PropertyMorphableData;
use Spatie\LaravelData\Data;

abstract class StoreInventoryMovementData extends Data implements PropertyMorphableData
{
    use ResolvesTenantInventoryValidationRules;

    #[PropertyForMorph]
    public InventoryMovementKind $kind;

    /**
     * @param  array<string, mixed>  $properties
     */
    final public static function morph(array $properties): ?string
    {
        $kind = $properties['kind'] ?? null;

        if ($kind instanceof InventoryMovementKind) {
            $kind = $kind->value;
        }

        return match ($kind) {
            InventoryMovementKind::Receipt->value => ReceiptInventoryMovementData::class,
            InventoryMovementKind::Adjustment->value => AdjustmentInventoryMovementData::class,
            InventoryMovementKind::Transfer->value => TransferInventoryMovementData::class,
            default => null,
        };
    }
}
