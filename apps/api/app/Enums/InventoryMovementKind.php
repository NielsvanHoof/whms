<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Describes how stock should change for a single inventory movement request.
 *
 * Receipts add stock. Adjustments apply a signed delta (cycle counts, corrections).
 * Transfers move units between two locations in one atomic transaction.
 */
enum InventoryMovementKind: string
{
    case Receipt = 'receipt';
    case Adjustment = 'adjustment';
    case Transfer = 'transfer';
}
