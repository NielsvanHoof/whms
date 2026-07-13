<?php

declare(strict_types=1);

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

it('requires authentication for logout', function () {
    $this->postJson('/api/v1/auth/logout')
        ->assertUnauthorized()
        ->assertHeader('content-type', 'application/json');
});

it('invalidates the current session on logout', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create([
        'tenant_id' => $tenant->id,
        'email' => 'user@example.com',
        'password' => Hash::make('SuperSecret123!'),
    ]);

    $this
        ->withHeader('Origin', 'http://localhost:3000')
        ->postJson('/api/v1/auth/login', [
            'email' => 'user@example.com',
            'password' => 'SuperSecret123!',
            'device_name' => 'phpunit',
        ])->assertOk();

    $this->assertAuthenticatedAs($user, 'web');

    $this
        ->withHeader('Origin', 'http://localhost:3000')
        ->postJson('/api/v1/auth/logout')->assertNoContent();

    $this->assertGuest('web');

    $this->app['auth']->forgetGuards();

    $this
        ->withHeader('Origin', 'http://localhost:3000')
        ->getJson('/api/v1/me')
        ->assertUnauthorized();
});

it('still revokes the current api token on logout', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $token = $user->createToken('phpunit')->plainTextToken;

    $this->withToken($token)->postJson('/api/v1/auth/logout')
        ->assertNoContent();

    $this->assertDatabaseCount('personal_access_tokens', 0);

    $this->app['auth']->forgetGuards();

    $this->withToken($token)->getJson('/api/v1/me')
        ->assertUnauthorized();
});
