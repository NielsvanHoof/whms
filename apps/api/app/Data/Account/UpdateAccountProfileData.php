<?php

declare(strict_types=1);

namespace App\Data\Account;

use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

final class UpdateAccountProfileData extends Data
{
    public function __construct(
        #[Max(255)]
        public string $name,
    ) {}

    /**
     * @return array<string, array<int, mixed>>
     */
    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['prohibited'],
        ];
    }
}
