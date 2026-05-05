<?php

namespace App\Data\Auth;

use Spatie\LaravelData\Attributes\Validation\Email;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Password;
use Spatie\LaravelData\Data;

class LoginData extends Data
{
    public function __construct(
        #[Email]
        public string $email,

        #[Password]
        public string $password,

        #[Max(255)]
        public ?string $device_name,
    ) {}
}
