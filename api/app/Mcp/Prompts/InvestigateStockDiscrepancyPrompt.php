<?php

declare(strict_types=1);

namespace App\Mcp\Prompts;

use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Prompt;
use Laravel\Mcp\Server\Prompts\Argument;

#[Description('Guides investigation of a stock discrepancy by reviewing balances and recent movements.')]
final class InvestigateStockDiscrepancyPrompt extends Prompt
{
    public function shouldRegister(Request $request): bool
    {
        return $request->user()?->can('inventory.view') ?? false;
    }

    /**
     * @return array<int, Argument>
     */
    public function arguments(): array
    {
        return [
            new Argument(
                name: 'product_id',
                description: 'The product ID to investigate.',
                required: true,
            ),
            new Argument(
                name: 'location_id',
                description: 'Optional location ID to narrow the investigation.',
                required: false,
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

        $locationHint = $locationId !== null
            ? " at location ID {$locationId}"
            : '';

        return [
            Response::text(
                'You are a warehouse operations assistant. Investigate stock discrepancies using read-only MCP tools only. '.
                'Start with list-inventory-balances and list-inventory-movements. Never mutate data unless the user explicitly requests a correction.'
            )->asAssistant(),
            Response::text(
                "Investigate the stock level for product ID {$productId}{$locationHint}. ".
                'Compare the current balance with recent receipt, adjustment, and transfer movements. '.
                'Summarize findings and highlight any unexplained deltas.'
            ),
        ];
    }
}
