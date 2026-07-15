<?php

declare(strict_types=1);

namespace App\Mcp\Resources;

use App\Http\Resources\InventoryMovementResource;
use App\Mcp\Concerns\EncodesMcpJson;
use App\Mcp\Concerns\RegistersForPermission;
use App\Models\InventoryMovement;
use Illuminate\Support\Facades\Gate;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\MimeType;
use Laravel\Mcp\Server\Contracts\HasUriTemplate;
use Laravel\Mcp\Server\Resource;
use Laravel\Mcp\Support\UriTemplate;

#[Description('Returns a single inventory movement with related warehouse, location, and product.')]
#[MimeType('application/json')]
final class InventoryMovementTemplateResource extends Resource implements HasUriTemplate
{
    use EncodesMcpJson;
    use RegistersForPermission;

    public function uriTemplate(): UriTemplate
    {
        return new UriTemplate('whms://movements/{id}');
    }

    public function handle(Request $request): Response
    {
        $movementId = (int) $request->get('id');

        $movement = InventoryMovement::query()
            ->with(['warehouse', 'location', 'product'])
            ->findOrFail($movementId);

        Gate::authorize('view', $movement);

        return $this->jsonResource(new InventoryMovementResource($movement));
    }

    protected function permission(): string
    {
        return 'inventory.view';
    }
}
