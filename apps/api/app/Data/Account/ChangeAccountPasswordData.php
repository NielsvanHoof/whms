<?php

declare(strict_types=1);

namespace App\Data\Account;

use App\Models\User;
use Closure;
use Illuminate\Support\Facades\Hash;
use Spatie\LaravelData\Attributes\Validation\Password;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

final class ChangeAccountPasswordData extends Data
{
    public function __construct(
        public string $current_password,

        #[Password(min: 8)]
        public string $password,

        public string $password_confirmation,
    ) {}

    /**
     * @return array<string, array<int, mixed>>
     */
    public static function rules(?ValidationContext $context = null): array
    {
        /** @var User|null $user */
        $user = auth()->user();

        return [
            'current_password' => [
                'required',
                'string',
                function (string $attribute, mixed $value, Closure $fail) use ($user): void {
                    if (! $user instanceof User || ! Hash::check((string) $value, $user->password)) {
                        $fail(__('The provided password does not match your current password.'));
                    }
                },
            ],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required', 'string'],
        ];
    }
}
