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

    public function test_logout_revokes_current_token(): void
    {
        $tenant = Tenant::factory()->create();
        User::factory()->create([
            'tenant_id' => $tenant->id,
            'email' => 'user@example.com',
            'password' => Hash::make('SuperSecret123!'),
        ]);

        $token = $this->postJson('/api/v1/auth/login', [
            'email' => 'user@example.com',
            'password' => 'SuperSecret123!',
            'device_name' => 'phpunit',
        ])->assertOk()->json('token');

        $this->assertIsString($token);

        $this->withToken($token)->postJson('/api/v1/auth/logout')
            ->assertNoContent();

        $this->assertDatabaseCount('personal_access_tokens', 0);

        // Simulate a fresh request (auth state can persist on the app instance between test HTTP calls).
        $this->app['auth']->forgetGuards();

        $this->withToken($token)->getJson('/api/v1/me')
            ->assertUnauthorized();
    }
}
