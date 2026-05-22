<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Data\Auth\LoginData;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

final class LoginController extends Controller
{
    /**
     * Exchange email and password for a Sanctum personal access token.
     */
    public function __invoke(LoginData $data): JsonResponse
    {
        if (! Auth::guard('web')->attempt(['email' => $data->email, 'password' => $data->password])) {
            throw ValidationException::withMessages([
                'email' => [__('auth.failed')],
            ]);
        }

        $user = Auth::guard('web')->user();
        Auth::guard('web')->logout();
        $deviceName = $data->device_name ?? 'api';

        $plainTextToken = $user->createToken($deviceName)->plainTextToken;

        return response()->json([
            'token' => $plainTextToken,
            'token_type' => 'Bearer',
            'user' => new UserResource($user),
        ]);
    }
}
