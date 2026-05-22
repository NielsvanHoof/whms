<?php

declare(strict_types=1);

use App\Http\Controllers\Account\ListAccountSessionsController;
use App\Http\Controllers\Account\RevokeAccountSessionController;
use App\Http\Controllers\Account\RevokeAllAccountSessionsController;
use App\Http\Controllers\Account\UpdateAccountPasswordController;
use App\Http\Controllers\Account\UpdateAccountProfileController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\MeController;
use App\Http\Controllers\InventoryBalanceController;
use App\Http\Controllers\InventoryMovementController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RoleManagementController;
use App\Http\Controllers\WarehouseController;
use App\Http\Middleware\EnsureCurrentTenantFromAuthenticatedUser;
use Illuminate\Support\Facades\Route;
use Spatie\Multitenancy\Http\Middleware\NeedsTenant;

/*
|--------------------------------------------------------------------------
| API routes (prefix /api is applied by the framework bootstrap)
|--------------------------------------------------------------------------
| Versioned under v1 so v2 can be introduced without breaking clients.
*/

Route::prefix('v1')->group(function (): void {
    Route::get('/health', function () {
        return response()->json(['status' => 'ok']);
    });

    Route::post('/auth/login', LoginController::class)
        ->middleware('throttle:10,1');

    Route::middleware([
        'auth:sanctum',
        EnsureCurrentTenantFromAuthenticatedUser::class,
        NeedsTenant::class,
    ])->group(function (): void {
        Route::get('/me', MeController::class);

        Route::patch('/account/profile', UpdateAccountProfileController::class);
        Route::put('/account/password', UpdateAccountPasswordController::class)
            ->middleware('throttle:5,1');

        Route::get('/account/sessions', ListAccountSessionsController::class);
        Route::delete('/account/sessions', RevokeAllAccountSessionsController::class);
        Route::delete('/account/sessions/{token}', RevokeAccountSessionController::class)
            ->whereNumber('token');

        Route::post('/auth/logout', LogoutController::class);

        Route::apiResource('warehouses', WarehouseController::class);
        Route::apiResource('products', ProductController::class);
        Route::apiResource('locations', LocationController::class);

        Route::apiResource('inventory-balances', InventoryBalanceController::class)->only(['index', 'show']);
        Route::get('inventory-movements', [InventoryMovementController::class, 'index']);
        Route::get('inventory-movements/{inventory_movement}', [InventoryMovementController::class, 'show']);
        Route::post('inventory-movements', [InventoryMovementController::class, 'store']);

        Route::prefix('access')->group(function (): void {
            Route::get('roles', [RoleManagementController::class, 'roles']);
            Route::get('permissions', [RoleManagementController::class, 'permissions']);
            Route::get('users', [RoleManagementController::class, 'users']);
            Route::put('users/{user}/roles', [RoleManagementController::class, 'syncUserRoles']);
        });
    });
});
