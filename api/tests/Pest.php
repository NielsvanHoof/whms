<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

pest()->extend(TestCase::class)->in('Feature');

uses(RefreshDatabase::class)->in('Feature');

/**
 * @return non-empty-string
 */
function createApiToken(User $user, ?string $deviceName = 'phpunit'): string
{
    return $user->createToken($deviceName ?? 'phpunit')->plainTextToken;
}

function downloadContent(TestResponse $response): string
{
    $file = $response->baseResponse->getFile();

    return file_get_contents($file->getPathname());
}
