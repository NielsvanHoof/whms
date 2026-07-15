<?php

declare(strict_types=1);

namespace App\Data\Auth;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

final class ForgotPasswordData extends Data
{
    public function __construct(
        public string $email,
    ) {}

    /**
     * @return array<string, array<int, mixed>>
     */
    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'email' => ['required', 'string', 'email'],
        ];
    }
}
