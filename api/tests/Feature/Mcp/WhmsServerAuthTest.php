<?php

declare(strict_types=1);

namespace Tests\Feature\Mcp;

use App\Mcp\Servers\WhmsServer;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use stdClass;
use Tests\Concerns\InteractsWithRbac;
use Tests\Concerns\InteractsWithWhmsMcp;
use Tests\TestCase;

final class WhmsServerAuthTest extends TestCase
{
    use InteractsWithRbac;
    use InteractsWithWhmsMcp;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedRbac();
    }

    public function test_mcp_web_route_requires_authentication(): void
    {
        $this->postJson('/mcp/whms', [
            'jsonrpc' => '2.0',
            'id' => 1,
            'method' => 'initialize',
            'params' => [
                'protocolVersion' => '2025-03-26',
                'capabilities' => new stdClass,
                'clientInfo' => [
                    'name' => 'test',
                    'version' => '1.0.0',
                ],
            ],
        ])->assertUnauthorized();
    }

    public function test_get_me_tool_requires_authentication(): void
    {
        $response = WhmsServer::tool(\App\Mcp\Tools\GetMeTool::class);

        $response->assertHasErrors();
    }

    public function test_authenticated_user_can_call_get_me_tool(): void
    {
        ['user' => $user] = $this->actingAsTenantUser('manager');

        $response = WhmsServer::actingAs($user)->tool(\App\Mcp\Tools\GetMeTool::class);

        $response
            ->assertOk()
            ->assertSee($user->email);
    }

    public function test_viewer_cannot_see_create_warehouse_tool(): void
    {
        ['user' => $user] = $this->actingAsTenantUser('viewer');

        $response = WhmsServer::actingAs($user)->tool(\App\Mcp\Tools\CreateWarehouseTool::class, [
            'name' => 'Blocked',
        ]);

        $response->assertHasErrors();
    }

    public function test_manager_can_create_warehouse_via_mcp_tool(): void
    {
        ['tenant' => $tenant, 'user' => $user] = $this->actingAsTenantUser('manager');

        $response = WhmsServer::actingAs($user)->tool(\App\Mcp\Tools\CreateWarehouseTool::class, [
            'name' => 'Agent DC',
            'code' => 'AGENT-01',
        ]);

        $response
            ->assertOk()
            ->assertSee('Agent DC')
            ->assertSee('AGENT-01');

        $this->assertDatabaseHas('warehouses', [
            'tenant_id' => $tenant->id,
            'name' => 'Agent DC',
            'code' => 'AGENT-01',
        ]);
    }

    public function test_user_cannot_access_cross_tenant_warehouse(): void
    {
        $tenantA = Tenant::factory()->create();
        $tenantB = Tenant::factory()->create();

        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
        $this->assignRole($userA, 'manager');
        $tenantA->makeCurrent();

        $foreignWarehouse = Warehouse::factory()->create(['tenant_id' => $tenantB->id]);

        $response = WhmsServer::actingAs($userA)->tool(\App\Mcp\Tools\GetWarehouseTool::class, [
            'warehouse_id' => $foreignWarehouse->id,
        ]);

        $response->assertHasErrors();
    }

    public function test_authenticated_web_request_reaches_mcp_with_sanctum(): void
    {
        ['user' => $user] = $this->actingAsTenantUser('viewer');

        Sanctum::actingAs($user);

        $this->postJson('/mcp/whms', [
            'jsonrpc' => '2.0',
            'id' => 1,
            'method' => 'initialize',
            'params' => [
                'protocolVersion' => '2025-03-26',
                'capabilities' => new stdClass,
                'clientInfo' => [
                    'name' => 'test',
                    'version' => '1.0.0',
                ],
            ],
        ])->assertSuccessful();
    }
}
