<?php

declare(strict_types=1);

namespace App\Mcp\Servers;

use App\Mcp\Prompts\InvestigateStockDiscrepancyPrompt;
use App\Mcp\Prompts\RecordInventoryReceiptPrompt;
use App\Mcp\Prompts\TransferStockPrompt;
use App\Mcp\Resources\InventoryMovementTemplateResource;
use App\Mcp\Resources\TenantPermissionsResource;
use App\Mcp\Resources\WarehouseCatalogResource;
use App\Mcp\Tools\CreateLocationTool;
use App\Mcp\Tools\CreateProductTool;
use App\Mcp\Tools\CreateWarehouseTool;
use App\Mcp\Tools\GetInventoryBalanceTool;
use App\Mcp\Tools\GetInventoryMovementTool;
use App\Mcp\Tools\GetLocationTool;
use App\Mcp\Tools\GetMeTool;
use App\Mcp\Tools\GetProductTool;
use App\Mcp\Tools\GetWarehouseTool;
use App\Mcp\Tools\ListInventoryBalancesTool;
use App\Mcp\Tools\ListInventoryMovementsTool;
use App\Mcp\Tools\ListLocationsTool;
use App\Mcp\Tools\ListProductsTool;
use App\Mcp\Tools\ListWarehousesTool;
use App\Mcp\Tools\RecordInventoryMovementTool;
use App\Mcp\Tools\UpdateLocationTool;
use App\Mcp\Tools\UpdateProductTool;
use App\Mcp\Tools\UpdateWarehouseTool;
use Laravel\Mcp\Server;
use Laravel\Mcp\Server\Attributes\Instructions;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Version;

#[Name('WHMS')]
#[Version('1.0.0')]
#[Instructions(
    'Warehouse Management System MCP server for the authenticated user\'s tenant. '.
    'All data is tenant-scoped. Movement kinds are receipt (add stock), adjustment (signed delta), and transfer (same warehouse). '.
    'Use read-only tools to inspect data first. Only call destructive tools after explicit user confirmation. '.
    'Never manage roles, passwords, or sessions through MCP.'
)]
final class WhmsServer extends Server
{
    /**
     * @var array<int, class-string<Server\Tool>>
     */
    protected array $tools = [
        GetMeTool::class,
        ListWarehousesTool::class,
        GetWarehouseTool::class,
        ListProductsTool::class,
        GetProductTool::class,
        ListLocationsTool::class,
        GetLocationTool::class,
        ListInventoryBalancesTool::class,
        GetInventoryBalanceTool::class,
        ListInventoryMovementsTool::class,
        GetInventoryMovementTool::class,
        CreateWarehouseTool::class,
        UpdateWarehouseTool::class,
        CreateProductTool::class,
        UpdateProductTool::class,
        CreateLocationTool::class,
        UpdateLocationTool::class,
        RecordInventoryMovementTool::class,
    ];

    /**
     * @var array<int, class-string<Server\Resource>>
     */
    protected array $resources = [
        TenantPermissionsResource::class,
        WarehouseCatalogResource::class,
        InventoryMovementTemplateResource::class,
    ];

    /**
     * @var array<int, class-string<Server\Prompt>>
     */
    protected array $prompts = [
        InvestigateStockDiscrepancyPrompt::class,
        RecordInventoryReceiptPrompt::class,
        TransferStockPrompt::class,
    ];
}
