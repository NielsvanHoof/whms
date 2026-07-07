<?php

declare(strict_types=1);

namespace App\Data\Access;

use Illuminate\Validation\Rule;
use Spatie\LaravelData\Attributes\Validation\Password;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

final class StoreAccessUserData extends Data
{
    /**
     * @param  list<string>  $roles
     */
    public function __construct(
        public string $name,
        public string $email,

        #[Password(min: 8)]
        public string $password,

        public string $password_confirmation,
        public array $roles,
    ) {}

    /**
     * @return array<string, array<int, mixed>>
     */
    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required', 'string'],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => [
                'required',
                'string',
                Rule::exists('roles', 'name')->where(
                    fn ($query) => $query->where('guard_name', 'web')
                ),
            ],
        ];
    }
}
