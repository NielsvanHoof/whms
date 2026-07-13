<?php

declare(strict_types=1);

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

it('requires authentication to update password', function () {
    $this->putJson('/api/v1/account/password', [
        'current_password' => 'OldPassword123!',
        'password' => 'NewPassword123!',
        'password_confirmation' => 'NewPassword123!',
    ])
        ->assertUnauthorized()
        ->assertHeader('content-type', 'application/json');
});

it('rejects incorrect current password', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create([
        'tenant_id' => $tenant->id,
        'email' => 'user@example.com',
        'password' => Hash::make('OldPassword123!'),
    ]);

    $token = createApiToken($user);

    $this->withToken($token)->putJson('/api/v1/account/password', [
        'current_password' => 'WrongPassword123!',
        'password' => 'NewPassword123!',
        'password_confirmation' => 'NewPassword123!',
    ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['current_password']);
});

it('rejects weak or unconfirmed password', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create([
        'tenant_id' => $tenant->id,
        'email' => 'user@example.com',
        'password' => Hash::make('OldPassword123!'),
    ]);

    $token = createApiToken($user);

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
});

it('updates password and allows login with new password', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create([
        'tenant_id' => $tenant->id,
        'email' => 'user@example.com',
        'password' => Hash::make('OldPassword123!'),
    ]);

    $token = createApiToken($user);

    $this->withToken($token)->putJson('/api/v1/account/password', [
        'current_password' => 'OldPassword123!',
        'password' => 'NewPassword123!',
        'password_confirmation' => 'NewPassword123!',
    ])
        ->assertNoContent();

    $this->withHeader('Origin', 'http://localhost:3000')->postJson('/api/v1/auth/login', [
        'email' => 'user@example.com',
        'password' => 'OldPassword123!',
    ])->assertUnprocessable();

    $this->withHeader('Origin', 'http://localhost:3000')->postJson('/api/v1/auth/login', [
        'email' => 'user@example.com',
        'password' => 'NewPassword123!',
    ])->assertOk()
        ->assertJsonStructure(['user']);
});
