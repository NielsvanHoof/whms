<?php

declare(strict_types=1);

namespace Tests\Feature\Auth;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

final class LogoutApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_logout_requires_authentication(): void
    {
        $this->postJson('/api/v1/auth/logout')
            ->assertUnauthorized()
            ->assertHeader('content-type', 'application/json');
    }

    public function test_logout_invalidates_current_session(): void
    {
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
    }

    public function test_logout_still_revokes_current_api_token(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $token = $user->createToken('phpunit')->plainTextToken;

        $this->withToken($token)->postJson('/api/v1/auth/logout')
            ->assertNoContent();

        $this->assertDatabaseCount('personal_access_tokens', 0);

        $this->app['auth']->forgetGuards();

        $this->withToken($token)->getJson('/api/v1/me')
            ->assertUnauthorized();
    }
}
