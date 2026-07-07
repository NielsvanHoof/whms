<?php

declare(strict_types=1);

namespace Tests\Feature\Auth;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

final class PasswordResetApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_returns_success_for_unknown_email(): void
    {
        $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'missing@example.com',
        ])->assertOk()
            ->assertJsonStructure(['message']);
    }

    public function test_forgot_password_sends_notification_for_known_email(): void
    {
        Notification::fake();

        $tenant = Tenant::factory()->create();
        $user = User::factory()->create([
            'tenant_id' => $tenant->id,
            'email' => 'reset@example.com',
        ]);

        $this->postJson('/api/v1/auth/forgot-password', [
            'email' => $user->email,
        ])->assertOk();

        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_reset_password_updates_password_with_valid_token(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create([
            'tenant_id' => $tenant->id,
            'email' => 'reset@example.com',
            'password' => Hash::make('old-password'),
        ]);

        $token = Password::createToken($user);

        $this->postJson('/api/v1/auth/reset-password', [
            'email' => $user->email,
            'token' => $token,
            'password' => 'new-password-1',
            'password_confirmation' => 'new-password-1',
        ])->assertOk()
            ->assertJsonStructure(['message']);

        $user->refresh();

        $this->assertTrue(Hash::check('new-password-1', $user->password));
    }

    public function test_reset_password_rejects_invalid_token(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create([
            'tenant_id' => $tenant->id,
            'email' => 'reset@example.com',
        ]);

        $this->postJson('/api/v1/auth/reset-password', [
            'email' => $user->email,
            'token' => 'invalid-token',
            'password' => 'new-password-1',
            'password_confirmation' => 'new-password-1',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }
}
