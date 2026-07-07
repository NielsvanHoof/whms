<?php

declare(strict_types=1);

namespace Tests\Feature\Tenant;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\InteractsWithRbac;
use Tests\TestCase;

final class UpdateTenantApiTest extends TestCase
{
    use InteractsWithRbac;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedRbac();
    }

    public function test_tenant_update_requires_authentication(): void
    {
        $this->patchJson('/api/v1/tenant', [
            'name' => 'Renamed',
        ])->assertUnauthorized();
    }

    public function test_manager_can_update_tenant_name(): void
    {
        $tenant = Tenant::factory()->create(['name' => 'Before', 'slug' => 'before']);
        $manager = User::factory()->create(['tenant_id' => $tenant->id]);
        $this->assignRole($manager, 'manager');
        $tenant->makeCurrent();

        Sanctum::actingAs($manager);

        $this->patchJson('/api/v1/tenant', [
            'name' => 'After',
        ])->assertSuccessful()
            ->assertJsonPath('data.name', 'After')
            ->assertJsonPath('data.slug', 'before');

        $this->assertDatabaseHas('tenants', [
            'id' => $tenant->id,
            'name' => 'After',
        ]);
    }

    public function test_viewer_cannot_update_tenant(): void
    {
        $tenant = Tenant::factory()->create();
        $viewer = User::factory()->create(['tenant_id' => $tenant->id]);
        $this->assignRole($viewer, 'viewer');
        $tenant->makeCurrent();

        Sanctum::actingAs($viewer);

        $this->patchJson('/api/v1/tenant', [
            'name' => 'Blocked',
        ])->assertForbidden();
    }

    public function test_manager_cannot_use_duplicate_slug(): void
    {
        $tenantA = Tenant::factory()->create(['slug' => 'taken']);
        $tenantB = Tenant::factory()->create(['slug' => 'mine']);
        $manager = User::factory()->create(['tenant_id' => $tenantB->id]);
        $this->assignRole($manager, 'manager');
        $tenantB->makeCurrent();

        Sanctum::actingAs($manager);

        $this->patchJson('/api/v1/tenant', [
            'slug' => 'taken',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['slug']);
    }
}
