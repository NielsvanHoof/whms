<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Data\Auth\ResetPasswordData;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

final class ResetPasswordController extends Controller
{
    /**
     * Reset the user's password using a valid reset token.
     */
    public function __invoke(ResetPasswordData $data): JsonResponse
    {
        $status = Password::reset(
            [
                'email' => $data->email,
                'password' => $data->password,
                'password_confirmation' => $data->password_confirmation,
                'token' => $data->token,
            ],
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();
            },
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return response()->json([
            'message' => __('passwords.reset'),
        ]);
    }
}
