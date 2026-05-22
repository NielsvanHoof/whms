<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Concerns\ResolvesCurrentAccessToken;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Sanctum\PersonalAccessToken;

final class LogoutController extends Controller
{
    use ResolvesCurrentAccessToken;

    public function __invoke(Request $request): Response
    {
        $tokenId = $this->currentAccessTokenId($request);

        if ($tokenId !== null) {
            PersonalAccessToken::query()->whereKey($tokenId)->delete();
        }

        return response()->noContent();
    }
}
