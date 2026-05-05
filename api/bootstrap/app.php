<?php

use App\Http\Middleware\EnsureCurrentTenantFromAuthenticatedUser;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Spatie\Multitenancy\Exceptions\NoCurrentTenant;
use Spatie\Multitenancy\Http\Middleware\NeedsTenant;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        /*
         * Laravel defaults to redirectGuestsTo(route('login')). This API has no web `login`
         * route; unauthenticated browser hits (no Accept: application/json) would throw
         * RouteNotFoundException. Returning null yields a 401 from the exception handler.
         */
        $middleware->redirectGuestsTo(fn (): ?string => null);

        /*
         * Route model binding must run after the current tenant is known; otherwise
         * tenant global scopes see no current tenant and return cross-tenant rows.
         */
        $middleware->prependToPriorityList(SubstituteBindings::class, NeedsTenant::class);
        $middleware->prependToPriorityList(NeedsTenant::class, EnsureCurrentTenantFromAuthenticatedUser::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Treat all `/api/*` failures as JSON so clients get structured errors without Accept headers.
        $exceptions->shouldRenderJsonWhen(function (Request $request, \Throwable $e): bool {
            return $request->is('api/*') || $request->expectsJson();
        });

        $exceptions->render(function (NoCurrentTenant $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => $e->getMessage(),
                ], 400);
            }

            return null;
        });
    })->create();
