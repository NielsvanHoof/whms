<?php

declare(strict_types=1);

use App\Mcp\Servers\WhmsServer;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Warehouse;
use Laravel\Sanctum\Sanctum;
use stdClass;
use Tests\Concerns\InteractsWithRbac;
use Tests\Concerns\InteractsWithWhmsMcp;

uses(InteractsWithRbac::class, InteractsWithWhmsMcp::class);

beforeEach(fn () => $this->seedRbac());

it('requires authentication for mcp web route', function () {
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
});

it('requires authentication for get me tool', function () {
    $response = WhmsServer::tool(App\Mcp\Tools\GetMeTool::class);

    $response->assertHasErrors();
});

it('allows authenticated user to call get me tool', function () {
    ['user' => $user] = $this->actingAsTenantUser('manager');

    $response = WhmsServer::actingAs($user)->tool(App\Mcp\Tools\GetMeTool::class);

    $response
        ->assertOk()
        ->assertSee($user->email);
});

it('prevents viewer from seeing create warehouse tool', function () {
    ['user' => $user] = $this->actingAsTenantUser('viewer');

    $response = WhmsServer::actingAs($user)->tool(App\Mcp\Tools\CreateWarehouseTool::class, [
        'name' => 'Blocked',
    ]);

    $response->assertHasErrors();
});

it('allows manager to create warehouse via mcp tool', function () {
    ['tenant' => $tenant, 'user' => $user] = $this->actingAsTenantUser('manager');

    $response = WhmsServer::actingAs($user)->tool(App\Mcp\Tools\CreateWarehouseTool::class, [
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
});

it('prevents user from accessing cross tenant warehouse', function () {
    $tenantA = Tenant::factory()->create();
    $tenantB = Tenant::factory()->create();

    $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
    $this->assignRole($userA, 'manager');
    $tenantA->makeCurrent();

    $foreignWarehouse = Warehouse::factory()->create(['tenant_id' => $tenantB->id]);

    $response = WhmsServer::actingAs($userA)->tool(App\Mcp\Tools\GetWarehouseTool::class, [
        'warehouse_id' => $foreignWarehouse->id,
    ]);

    $response->assertHasErrors();
});

it('allows authenticated web request to reach mcp with sanctum', function () {
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
});
