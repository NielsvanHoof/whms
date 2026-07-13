<?php

declare(strict_types=1);

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;

it('returns success for unknown email on forgot password', function () {
    $this->postJson('/api/v1/auth/forgot-password', [
        'email' => 'missing@example.com',
    ])->assertOk()
        ->assertJsonStructure(['message']);
});

it('sends notification for known email on forgot password', function () {
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
});

it('updates password with valid reset token', function () {
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

    expect(Hash::check('new-password-1', $user->password))->toBeTrue();
});

it('rejects invalid reset token', function () {
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
});
