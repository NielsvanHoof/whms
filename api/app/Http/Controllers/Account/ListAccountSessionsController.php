<?php

declare(strict_types=1);

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Concerns\ResolvesCurrentAccessToken;
use App\Http\Controllers\Controller;
use App\Http\Resources\AccountSessionResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

final class ListAccountSessionsController extends Controller
{
    use ResolvesCurrentAccessToken;

    public function __invoke(Request $request): AnonymousResourceCollection
    {
        /** @var User $user */
        $user = $request->user();

        $currentAccessTokenId = $this->currentAccessTokenId($request);

        $sessions = $user->tokens()
            ->orderByDesc('last_used_at')
            ->orderByDesc('id')
            ->get();

        return AccountSessionResource::collection(
            $sessions->map(
                fn ($session) => new AccountSessionResource($session, $currentAccessTokenId)
            )
        );
    }
}
