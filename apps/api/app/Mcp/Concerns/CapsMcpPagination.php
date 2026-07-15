<?php

declare(strict_types=1);

namespace App\Mcp\Concerns;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;

/**
 * Limits how many rows agents can pull in a single MCP list call.
 */
trait CapsMcpPagination
{
    public const int MAX_PER_PAGE = 50;

    protected function cappedPerPage(Request $request): int
    {
        return min(max((int) $request->get('per_page', 15), 1), self::MAX_PER_PAGE);
    }

    protected function cappedPage(Request $request): int
    {
        return max((int) $request->get('page', 1), 1);
    }

    /**
     * @return array<string, mixed>
     */
    protected function paginationSchema(JsonSchema $schema): array
    {
        return [
            'page' => $schema->integer()
                ->description('Page number.')
                ->default(1),
            'per_page' => $schema->integer()
                ->description('Items per page (maximum '.self::MAX_PER_PAGE.').')
                ->default(15),
        ];
    }
}
