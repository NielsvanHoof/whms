<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\InteractsWithRbac;
use Tests\TestCase;

final class RoleManagementApiTest extends TestCase
{
    use InteractsWithRbac;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedRbac();
    }

    public function test_role_management_endpoints_require_authentication(): void
    {
        $this->getJson('/api/v1/access/roles')->assertUnauthorized();
        $this->getJson('/api/v1/access/permissions')->assertUnauthorized();
        $this->getJson('/api/v1/access/users')->assertUnauthorized();
    }

    public function test_manager_can_list_roles_permissions_and_tenant_users(): void
    {
        $tenant = Tenant::factory()->create();
        $manager = User::factory()->create(['tenant_id' => $tenant->id]);
        $viewer = User::factory()->create(['tenant_id' => $tenant->id]);
        $this->assignRole($manager, 'manager');
        $this->assignRole($viewer, 'viewer');

        Sanctum::actingAs($manager);

        $this->getJson('/api/v1/access/roles')
            ->assertOk()
            ->assertJsonPath('data.0.name', 'manager');

        $this->getJson('/api/v1/access/permissions')
            ->assertOk()
            ->assertJsonFragment(['roles.manage']);

        $this->getJson('/api/v1/access/users')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_viewer_cannot_access_role_management_endpoints(): void
    {
        $tenant = Tenant::factory()->create();
        $viewer = User::factory()->create(['tenant_id' => $tenant->id]);
        $this->assignRole($viewer, 'viewer');

        Sanctum::actingAs($viewer);

        $this->getJson('/api/v1/access/roles')->assertForbidden();
        $this->getJson('/api/v1/access/permissions')->assertForbidden();
        $this->getJson('/api/v1/access/users')->assertForbidden();
    }

    public function test_manager_can_assign_roles_to_user_in_same_tenant(): void
    {
        $tenant = Tenant::factory()->create();
        $manager = User::factory()->create(['tenant_id' => $tenant->id]);
        $target = User::factory()->create(['tenant_id' => $tenant->id]);
        $this->assignRole($manager, 'manager');
        $this->assignRole($target, 'viewer');

        Sanctum::actingAs($manager);

        $this->putJson('/api/v1/access/users/'.$target->id.'/roles', [
            'roles' => ['operator'],
        ])->assertOk()
            ->assertJsonPath('data.roles.0', 'operator');
    }

    public function test_manager_cannot_assign_roles_to_user_in_other_tenant(): void
    {
        $tenantA = Tenant::factory()->create();
        $tenantB = Tenant::factory()->create();
        $manager = User::factory()->create(['tenant_id' => $tenantA->id]);
        $otherTenantUser = User::factory()->create(['tenant_id' => $tenantB->id]);
        $this->assignRole($manager, 'manager');
        $this->assignRole($otherTenantUser, 'viewer');

        Sanctum::actingAs($manager);

        $this->putJson('/api/v1/access/users/'.$otherTenantUser->id.'/roles', [
            'roles' => ['operator'],
        ])->assertNotFound();
    }

    public function test_manager_cannot_assign_unknown_role(): void
    {
        $tenant = Tenant::factory()->create();
        $manager = User::factory()->create(['tenant_id' => $tenant->id]);
        $target = User::factory()->create(['tenant_id' => $tenant->id]);
        $this->assignRole($manager, 'manager');

        Sanctum::actingAs($manager);

        $this->putJson('/api/v1/access/users/'.$target->id.'/roles', [
            'roles' => ['not-a-role'],
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['roles.0']);
    }

    public function test_manager_can_create_user_in_same_tenant(): void
    {
        $tenant = Tenant::factory()->create();
        $manager = User::factory()->create(['tenant_id' => $tenant->id]);
        $this->assignRole($manager, 'manager');
        $tenant->makeCurrent();

        Sanctum::actingAs($manager);

        $this->postJson('/api/v1/access/users', [
            'name' => 'New Operator',
            'email' => 'operator@example.com',
            'password' => 'password-1',
            'password_confirmation' => 'password-1',
            'roles' => ['operator'],
        ])->assertCreated()
            ->assertJsonPath('data.email', 'operator@example.com')
            ->assertJsonPath('data.roles.0', 'operator');

        $this->assertDatabaseHas('users', [
            'tenant_id' => $tenant->id,
            'email' => 'operator@example.com',
        ]);
    }

    public function test_viewer_cannot_create_user(): void
    {
        $tenant = Tenant::factory()->create();
        $viewer = User::factory()->create(['tenant_id' => $tenant->id]);
        $this->assignRole($viewer, 'viewer');
        $tenant->makeCurrent();

        Sanctum::actingAs($viewer);

        $this->postJson('/api/v1/access/users', [
            'name' => 'Blocked',
            'email' => 'blocked@example.com',
            'password' => 'password-1',
            'password_confirmation' => 'password-1',
            'roles' => ['viewer'],
        ])->assertForbidden();
    }

    public function test_manager_cannot_create_user_with_duplicate_email(): void
    {
        $tenant = Tenant::factory()->create();
        $manager = User::factory()->create(['tenant_id' => $tenant->id]);
        User::factory()->create([
            'tenant_id' => $tenant->id,
            'email' => 'taken@example.com',
        ]);
        $this->assignRole($manager, 'manager');
        $tenant->makeCurrent();

        Sanctum::actingAs($manager);

        $this->postJson('/api/v1/access/users', [
            'name' => 'Duplicate',
            'email' => 'taken@example.com',
            'password' => 'password-1',
            'password_confirmation' => 'password-1',
            'roles' => ['viewer'],
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }
}
