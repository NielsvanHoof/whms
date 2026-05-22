<?php

declare(strict_types=1);

namespace Tests\Feature\Account;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

final class UpdateAccountPasswordApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_update_password_requires_authentication(): void
    {
        $this->putJson('/api/v1/account/password', [
            'current_password' => 'OldPassword123!',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ])
            ->assertUnauthorized()
            ->assertHeader('content-type', 'application/json');
    }

    public function test_update_password_rejects_incorrect_current_password(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create([
            'tenant_id' => $tenant->id,
            'email' => 'user@example.com',
            'password' => Hash::make('OldPassword123!'),
        ]);

        $token = $this->loginAndGetToken($user, 'OldPassword123!');

        $this->withToken($token)->putJson('/api/v1/account/password', [
            'current_password' => 'WrongPassword123!',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['current_password']);
    }

    public function test_update_password_rejects_weak_or_unconfirmed_password(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create([
            'tenant_id' => $tenant->id,
            'email' => 'user@example.com',
            'password' => Hash::make('OldPassword123!'),
        ]);

        $token = $this->loginAndGetToken($user, 'OldPassword123!');

        $this->withToken($token)->putJson('/api/v1/account/password', [
            'current_password' => 'OldPassword123!',
            'password' => 'short',
            'password_confirmation' => 'short',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);

        $this->withToken($token)->putJson('/api/v1/account/password', [
            'current_password' => 'OldPassword123!',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'Mismatch123!',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);
    }

    public function test_update_password_succeeds_and_new_password_works_for_login(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create([
            'tenant_id' => $tenant->id,
            'email' => 'user@example.com',
            'password' => Hash::make('OldPassword123!'),
        ]);

        $token = $this->loginAndGetToken($user, 'OldPassword123!');

        $this->withToken($token)->putJson('/api/v1/account/password', [
            'current_password' => 'OldPassword123!',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ])
            ->assertNoContent();

        $this->postJson('/api/v1/auth/login', [
            'email' => 'user@example.com',
            'password' => 'OldPassword123!',
        ])->assertUnprocessable();

        $this->postJson('/api/v1/auth/login', [
            'email' => 'user@example.com',
            'password' => 'NewPassword123!',
        ])->assertOk()
            ->assertJsonStructure(['token']);
    }

    /**
     * @return non-empty-string
     */
    private function loginAndGetToken(User $user, string $password): string
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => $password,
            'device_name' => 'phpunit',
        ])->assertOk();

        $token = $response->json('token');

        $this->assertIsString($token);
        $this->assertNotSame('', $token);

        return $token;
    }
}
