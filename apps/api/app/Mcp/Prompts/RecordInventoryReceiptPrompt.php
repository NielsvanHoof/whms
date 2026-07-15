<?php

declare(strict_types=1);

namespace App\Mcp\Prompts;

use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Prompt;
use Laravel\Mcp\Server\Prompts\Argument;

#[Description('Guides recording an inventory receipt with validation before calling record-inventory-movement.')]
final class RecordInventoryReceiptPrompt extends Prompt
{
    public function shouldRegister(Request $request): bool
    {
        return $request->user()?->can('inventory.manage') ?? false;
    }

    /**
     * @return array<int, Argument>
     */
    public function arguments(): array
    {
        return [
            new Argument(
                name: 'product_id',
                description: 'The product being received.',
                required: true,
            ),
            new Argument(
                name: 'location_id',
                description: 'The destination location for the receipt.',
                required: true,
            ),
            new Argument(
                name: 'quantity',
                description: 'The positive quantity being received.',
                required: true,
            ),
        ];
    }

    /**
     * @return array<int, Response>
     */
    public function handle(Request $request): array
    {
        $productId = $request->get('product_id');
        $locationId = $request->get('location_id');
        $quantity = $request->get('quantity');

        return [
            Response::text(
                'You are a warehouse operations assistant. Confirm receipt details with the user before calling record-inventory-movement. '.
                'Receipts require kind=receipt, a positive quantity, and valid tenant-scoped product and location IDs.'
            )->asAssistant(),
            Response::text(
                "Prepare an inventory receipt of {$quantity} units for product ID {$productId} into location ID {$locationId}. ".
                'Verify the product and location exist, confirm with the user, then call record-inventory-movement with kind receipt.'
            ),
        ];
    }
}
