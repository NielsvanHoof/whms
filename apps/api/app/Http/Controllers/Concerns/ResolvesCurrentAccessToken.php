<?php

declare(strict_types=1);

namespace App\Http\Controllers\Concerns;

use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

trait ResolvesCurrentAccessToken
{
    protected function currentAccessTokenId(Request $request): ?int
    {
        $accessToken = $request->user()?->currentAccessToken();

        if ($accessToken instanceof PersonalAccessToken) {
            return $accessToken->id;
        }

        if ($plainTextToken = $request->bearerToken()) {
            return PersonalAccessToken::findToken($plainTextToken)?->id;
        }

        return null;
    }
}
