<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Data\Auth\LoginData;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

final class LoginController extends Controller
{
    /**
     * Authenticate the first-party SPA using Laravel's session guard.
     */
    public function __invoke(LoginData $data, Request $request): JsonResponse
    {
        if (! Auth::guard('web')->attempt(['email' => $data->email, 'password' => $data->password])) {
            throw ValidationException::withMessages([
                'email' => [__('auth.failed')],
            ]);
        }

        $user = Auth::guard('web')->user();
        $request->session()->regenerate();

        return response()->json([
            'user' => new UserResource($user),
        ]);
    }
}
