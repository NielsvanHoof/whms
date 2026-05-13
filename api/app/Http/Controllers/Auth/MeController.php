<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\MeResource;
use Illuminate\Http\Request;

final class MeController extends Controller
{
    public function __invoke(Request $request): MeResource
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        return new MeResource($user->loadMissing('roles:id,name'));
    }
}
