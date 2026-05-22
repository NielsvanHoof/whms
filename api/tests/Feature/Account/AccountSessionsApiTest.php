<?php

declare(strict_types=1);

namespace Tests\Feature\Account;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;
use Tests\TestCase;

final class AccountSessionsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_list_sessions_requires_authentication(): void
    {
        $this->getJson('/api/v1/account/sessions')
            ->assertUnauthorized()
            ->assertHeader('content-type', 'application/json');
    }

    public function test_list_sessions_returns_only_current_user_tokens_with_current_flag(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create([
            'tenant_id' => $tenant->id,
            'email' => 'user@example.com',
            'password' => Hash::make('SuperSecret123!'),
        ]);

        $phoneToken = $this->loginAndGetToken($user, 'SuperSecret123!', 'iPhone');

        $this->postJson('/api/v1/auth/login', [
            'email' => 'user@example.com',
            'password' => 'SuperSecret123!',
            'device_name' => 'MacBook',
        ])->assertOk();

        $this->withToken($phoneToken)->getJson('/api/v1/account/sessions')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.is_current', true)
            ->assertJsonFragment(['name' => 'iPhone'])
            ->assertJsonFragment(['name' => 'MacBook']);
    }

    public function test_revoke_session_requires_authentication(): void
    {
        $this->deleteJson('/api/v1/account/sessions/1')
            ->assertUnauthorized();
    }

    public function test_revoke_session_returns_not_found_for_other_users_token(): void
    {
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

        $token = $this->loginAndGetToken($user, 'SuperSecret123!');

        $this->withToken($token)->deleteJson("/api/v1/account/sessions/{$otherUserTokenId}")
            ->assertNotFound();

        $this->assertDatabaseHas('personal_access_tokens', ['id' => $otherUserTokenId]);
    }

    public function test_revoke_session_deletes_token(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create([
            'tenant_id' => $tenant->id,
            'email' => 'user@example.com',
            'password' => Hash::make('SuperSecret123!'),
        ]);

        $macToken = $this->postJson('/api/v1/auth/login', [
            'email' => 'user@example.com',
            'password' => 'SuperSecret123!',
            'device_name' => 'MacBook',
        ])->assertOk()->json('token');

        $phoneToken = $this->loginAndGetToken($user, 'SuperSecret123!', 'iPhone');

        $macTokenId = PersonalAccessToken::query()
            ->where('name', 'MacBook')
            ->value('id');

        $this->assertIsInt($macTokenId);

        $this->withToken($phoneToken)->deleteJson("/api/v1/account/sessions/{$macTokenId}")
            ->assertNoContent();

        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $macTokenId]);

        $this->app['auth']->forgetGuards();

        $this->assertIsString($macToken);
        $this->withToken($macToken)->getJson('/api/v1/me')->assertUnauthorized();
        $this->withToken($phoneToken)->getJson('/api/v1/me')->assertOk();
    }

    public function test_revoke_all_sessions_requires_authentication(): void
    {
        $this->deleteJson('/api/v1/account/sessions')
            ->assertUnauthorized();
    }

    public function test_revoke_all_sessions_deletes_every_token_including_current(): void
    {
        $tenant = Tenant::factory()->create();
        User::factory()->create([
            'tenant_id' => $tenant->id,
            'email' => 'user@example.com',
            'password' => Hash::make('SuperSecret123!'),
        ]);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'user@example.com',
            'password' => 'SuperSecret123!',
            'device_name' => 'MacBook',
        ])->assertOk();

        $phoneToken = $this->postJson('/api/v1/auth/login', [
            'email' => 'user@example.com',
            'password' => 'SuperSecret123!',
            'device_name' => 'iPhone',
        ])->assertOk()->json('token');

        $this->assertIsString($phoneToken);

        $this->withToken($phoneToken)->deleteJson('/api/v1/account/sessions')
            ->assertNoContent();

        $this->assertDatabaseCount('personal_access_tokens', 0);

        $this->app['auth']->forgetGuards();

        $this->withToken($phoneToken)->getJson('/api/v1/me')
            ->assertUnauthorized();
    }

    /**
     * @return non-empty-string
     */
    private function loginAndGetToken(User $user, string $password, ?string $deviceName = 'phpunit'): string
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => $password,
            'device_name' => $deviceName,
        ])->assertOk();

        $token = $response->json('token');

        $this->assertIsString($token);
        $this->assertNotSame('', $token);

        return $token;
    }
}
