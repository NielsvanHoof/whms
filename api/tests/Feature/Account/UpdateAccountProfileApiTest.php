<?php

declare(strict_types=1);

namespace Tests\Feature\Account;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\InteractsWithRbac;
use Tests\TestCase;

final class UpdateAccountProfileApiTest extends TestCase
{
    use InteractsWithRbac;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedRbac();
    }

    public function test_update_profile_requires_authentication(): void
    {
        $this->patchJson('/api/v1/account/profile', ['name' => 'Jane Doe'])
            ->assertUnauthorized()
            ->assertHeader('content-type', 'application/json');
    }

    public function test_update_profile_updates_display_name(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create([
            'tenant_id' => $tenant->id,
            'name' => 'Old Name',
        ]);
        $this->assignRole($user, 'manager');

        Sanctum::actingAs($user);

        $this->patchJson('/api/v1/account/profile', ['name' => 'Jane Doe'])
            ->assertOk()
            ->assertJsonPath('data.user.name', 'Jane Doe')
            ->assertJsonPath('data.user.email', $user->email)
            ->assertJsonPath('data.tenant.id', $tenant->id);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Jane Doe',
            'email' => $user->email,
        ]);
    }

    public function test_update_profile_requires_name(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        Sanctum::actingAs($user);

        $this->patchJson('/api/v1/account/profile', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    }

    public function test_update_profile_rejects_email_changes(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        Sanctum::actingAs($user);

        $this->patchJson('/api/v1/account/profile', [
            'name' => 'Jane Doe',
            'email' => 'hacker@example.com',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'email' => $user->email,
        ]);
    }
}
