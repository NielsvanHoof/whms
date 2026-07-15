<?php

declare(strict_types=1);

namespace App\Mcp\Concerns;

use Laravel\Mcp\Request;

/**
 * Hides MCP tools from agents when the authenticated user lacks a permission.
 */
trait RegistersForPermission
{
    abstract protected function permission(): string;

    public function shouldRegister(Request $request): bool
    {
        $user = $request->user();

        return $user !== null && $user->can($this->permission());
    }
}
