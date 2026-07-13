<?php

declare(strict_types=1);

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;

it('requires authentication to list sessions', function () {
    $this->getJson('/api/v1/account/sessions')
        ->assertUnauthorized()
        ->assertHeader('content-type', 'application/json');
});

it('lists only current user tokens with current flag', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create([
        'tenant_id' => $tenant->id,
        'email' => 'user@example.com',
        'password' => Hash::make('SuperSecret123!'),
    ]);

    $phoneToken = createApiToken($user, 'iPhone');
    createApiToken($user, 'MacBook');

    $this->withToken($phoneToken)->getJson('/api/v1/account/sessions')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.is_current', true)
        ->assertJsonFragment(['name' => 'iPhone'])
        ->assertJsonFragment(['name' => 'MacBook']);
});

it('requires authentication to revoke session', function () {
    $this->deleteJson('/api/v1/account/sessions/1')
        ->assertUnauthorized();
});

it('returns not found when revoking another users token', function () {
    $tenant = Tenant::factory()->create();

    $user = User::factory()->create([
        'tenant_id' => $tenant->id,
        'email' => 'user@example.com',
        'password' => Hash::make('SuperSecret123!'),
    ]);

    $otherUser = User::factory()->create([
        'tenant_id' => $tenant->id,
        'email' => 'other@example.com',
        'password' => Hash::make('SuperSecret123!'),
    ]);

    $otherUserTokenId = (int) $otherUser->createToken('other-device')->accessToken->id;

    $token = createApiToken($user);

    $this->withToken($token)->deleteJson("/api/v1/account/sessions/{$otherUserTokenId}")
        ->assertNotFound();

    $this->assertDatabaseHas('personal_access_tokens', ['id' => $otherUserTokenId]);
});

it('deletes token when revoking session', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create([
        'tenant_id' => $tenant->id,
        'email' => 'user@example.com',
        'password' => Hash::make('SuperSecret123!'),
    ]);

    $macToken = createApiToken($user, 'MacBook');
    $phoneToken = createApiToken($user, 'iPhone');

    $macTokenId = PersonalAccessToken::query()
        ->where('name', 'MacBook')
        ->value('id');

    expect($macTokenId)->toBeInt();

    $this->withToken($phoneToken)->deleteJson("/api/v1/account/sessions/{$macTokenId}")
        ->assertNoContent();

    $this->assertDatabaseMissing('personal_access_tokens', ['id' => $macTokenId]);

    $this->app['auth']->forgetGuards();

    expect($macToken)->toBeString();
    $this->withToken($macToken)->getJson('/api/v1/me')->assertUnauthorized();
    $this->withToken($phoneToken)->getJson('/api/v1/me')->assertOk();
});

it('requires authentication to revoke all sessions', function () {
    $this->deleteJson('/api/v1/account/sessions')
        ->assertUnauthorized();
});

it('deletes every token including current when revoking all sessions', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create([
        'tenant_id' => $tenant->id,
        'email' => 'user@example.com',
        'password' => Hash::make('SuperSecret123!'),
    ]);

    createApiToken($user, 'MacBook');
    $phoneToken = createApiToken($user, 'iPhone');

    $this->withToken($phoneToken)->deleteJson('/api/v1/account/sessions')
        ->assertNoContent();

    $this->assertDatabaseCount('personal_access_tokens', 0);

    $this->app['auth']->forgetGuards();

    $this->withToken($phoneToken)->getJson('/api/v1/me')
        ->assertUnauthorized();
});
