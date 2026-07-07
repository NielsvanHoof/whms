<?php

declare(strict_types=1);

namespace App\Mcp\Resources;

use App\Mcp\Concerns\EncodesMcpJson;
use App\Mcp\Concerns\RegistersForPermission;
use App\Models\Warehouse;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\MimeType;
use Laravel\Mcp\Server\Attributes\Uri;
use Laravel\Mcp\Server\Resource;

#[Description('Compact warehouse catalog (id, code, name) for the current tenant.')]
#[MimeType('application/json')]
#[Uri('whms://warehouses')]
final class WarehouseCatalogResource extends Resource
{
    use EncodesMcpJson;
    use RegistersForPermission;

    public function handle(Request $request): Response
    {
        $warehouses = Warehouse::query()
            ->orderBy('name')
            ->get(['id', 'code', 'name']);

        return $this->json([
            'data' => $warehouses->map(fn (Warehouse $warehouse): array => [
                'id' => $warehouse->id,
                'code' => $warehouse->code,
                'name' => $warehouse->name,
            ])->values()->all(),
        ]);
    }

    protected function permission(): string
    {
        return 'warehouses.view';
    }
}
