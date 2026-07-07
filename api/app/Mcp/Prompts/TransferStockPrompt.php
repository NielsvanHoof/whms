<?php

declare(strict_types=1);

namespace App\Mcp\Prompts;

use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Prompt;
use Laravel\Mcp\Server\Prompts\Argument;

#[Description('Guides a same-warehouse stock transfer with validation before calling record-inventory-movement.')]
final class TransferStockPrompt extends Prompt
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
                description: 'The product being transferred.',
                required: true,
            ),
            new Argument(
                name: 'from_location_id',
                description: 'The source location ID.',
                required: true,
            ),
            new Argument(
                name: 'to_location_id',
                description: 'The destination location ID (same warehouse as source).',
                required: true,
            ),
            new Argument(
                name: 'quantity',
                description: 'The positive quantity to transfer.',
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
        $fromLocationId = $request->get('from_location_id');
        $toLocationId = $request->get('to_location_id');
        $quantity = $request->get('quantity');

        return [
            Response::text(
                'You are a warehouse operations assistant. Transfers must stay within the same warehouse. '.
                'Confirm source balance is sufficient before calling record-inventory-movement with kind transfer.'
            )->asAssistant(),
            Response::text(
                "Prepare a transfer of {$quantity} units of product ID {$productId} from location {$fromLocationId} to location {$toLocationId}. ".
                'Verify both locations belong to the same warehouse, confirm with the user, then record the transfer.'
            ),
        ];
    }
}
