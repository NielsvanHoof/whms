<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * After Sanctum authentication, bind the user's tenant as the current Spatie tenant.
 *
 * Automatic {@see Multitenancy::determineCurrentTenant} runs too early
 * for token auth, so we resolve the tenant here instead of a request-time TenantFinder.
 */
final class EnsureCurrentTenantFromAuthenticatedUser
{
    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // auth:sanctum should guarantee a user; tenant_id is non-nullable in the schema.
        if ($user === null) {
            abort(Response::HTTP_FORBIDDEN, 'User is not assigned to a tenant.');
        }

        $tenant = Tenant::query()->find($user->tenant_id);

        if ($tenant === null) {
            abort(Response::HTTP_FORBIDDEN, 'Tenant not found.');
        }

        $tenant->makeCurrent();

        return $next($request);
    }
}
