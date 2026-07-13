<?php

declare(strict_types=1);

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

it('requires email and password for login', function () {
    $response = $this->postJson('/api/v1/auth/login', []);

    $response->assertUnprocessable()
        ->assertHeader('content-type', 'application/json');
});

it('rejects invalid login credentials', function () {
    $tenant = Tenant::factory()->create();
    User::factory()->create([
        'tenant_id' => $tenant->id,
        'email' => 'user@example.com',
        'password' => Hash::make('SuperSecret123!'),
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'user@example.com',
        'password' => 'WrongPassword123!',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['email']);
});

it('creates a session for valid login credentials', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create([
        'tenant_id' => $tenant->id,
        'email' => 'user@example.com',
        'password' => Hash::make('SuperSecret123!'),
    ]);

    $this->withHeader('Origin', 'http://localhost:3000')
        ->get('/sanctum/csrf-cookie');

    $response = $this
        ->withHeader('Origin', 'http://localhost:3000')
        ->postJson('/api/v1/auth/login', [
            'email' => 'user@example.com',
            'password' => 'SuperSecret123!',
            'device_name' => 'phpunit',
        ]);

    $response->assertOk()
        ->assertJsonMissingPath('token')
        ->assertJsonMissingPath('token_type')
        ->assertJsonPath('user.id', $user->id)
        ->assertJsonStructure(['user' => ['id', 'tenant_id', 'name', 'email']]);

    $this->assertAuthenticatedAs($user, 'web');
});
