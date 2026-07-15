<?php

declare(strict_types=1);

namespace App\Http\Controllers\Account;

use App\Data\Account\UpdateAccountProfileData;
use App\Http\Controllers\Controller;
use App\Http\Resources\MeResource;
use App\Models\User;
use Illuminate\Http\Request;

final class UpdateAccountProfileController extends Controller
{
    public function __invoke(UpdateAccountProfileData $data, Request $request): MeResource
    {
        /** @var User $user */
        $user = $request->user();

        $user->update(['name' => $data->name]);

        return new MeResource($user->loadMissing([
            'roles:id,name',
            'tenant:id,name,slug',
        ]));
    }
}
