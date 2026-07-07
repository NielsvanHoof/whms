<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Data\Auth\ForgotPasswordData;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Password;

final class ForgotPasswordController extends Controller
{
    /**
     * Queue a password reset link for the given email address.
     *
     * Always returns success to avoid revealing whether the email exists.
     */
    public function __invoke(ForgotPasswordData $data): JsonResponse
    {
        Password::sendResetLink(['email' => $data->email]);

        return response()->json([
            'message' => __('passwords.sent'),
        ]);
    }
}
