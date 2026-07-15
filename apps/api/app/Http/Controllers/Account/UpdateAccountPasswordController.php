<?php

declare(strict_types=1);

namespace App\Http\Controllers\Account;

use App\Data\Account\ChangeAccountPasswordData;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

final class UpdateAccountPasswordController extends Controller
{
    public function __invoke(ChangeAccountPasswordData $data, Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $user->update(['password' => $data->password]);

        return response()->noContent();
    }
}
