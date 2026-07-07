<?php

declare(strict_types=1);

use App\Http\Middleware\EnsureCurrentTenantFromAuthenticatedUser;
use App\Mcp\Servers\WhmsServer;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Laravel\Mcp\Facades\Mcp;
use Spatie\Multitenancy\Http\Middleware\NeedsTenant;

RateLimiter::for('mcp', function (Request $request): Limit {
    return Limit::perMinute(60)->by($request->user()?->getAuthIdentifier() ?? $request->ip());
});

$mcpMiddleware = [
    'auth:sanctum',
    EnsureCurrentTenantFromAuthenticatedUser::class,
    NeedsTenant::class,
    'throttle:mcp',
];

Mcp::web('/mcp/whms', WhmsServer::class)->middleware($mcpMiddleware);
Mcp::local('whms', WhmsServer::class);
