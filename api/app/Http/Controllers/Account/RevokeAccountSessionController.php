<?php

declare(strict_types=1);

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

final class RevokeAccountSessionController extends Controller
{
    public function __invoke(Request $request, int $token): Response
    {
        /** @var User $user */
        $user = $request->user();

        $session = $user->tokens()->whereKey($token)->firstOrFail();

        $session->delete();

        return response()->noContent();
    }
}
