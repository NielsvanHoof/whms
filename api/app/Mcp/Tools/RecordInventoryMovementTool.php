<?php

declare(strict_types=1);

namespace App\Mcp\Tools;

use App\Data\Inventory\StoreInventoryMovementData;
use App\Enums\InventoryMovementKind;
use App\Http\Resources\InventoryMovementResource;
use App\Mcp\Concerns\EncodesMcpJson;
use App\Mcp\Concerns\RegistersForPermission;
use App\Models\InventoryMovement;
use App\Models\User;
use App\Services\ApplyInventoryMovementService;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsDestructive;

#[Description('Records an inventory receipt, adjustment, or transfer for the current tenant. Requires explicit user intent before calling.')]
#[IsDestructive]
final class RecordInventoryMovementTool extends Tool
{
    use EncodesMcpJson;
    use RegistersForPermission;

    public function handle(Request $request, ApplyInventoryMovementService $service): Response
    {
        Gate::authorize('create', InventoryMovement::class);

        /** @var User $user */
        $user = $request->user();

        $validated = $request->validate([
            'kind' => ['required', Rule::enum(InventoryMovementKind::class)],
        ], [
            'kind.required' => 'Specify the movement kind: receipt, adjustment, or transfer.',
            'kind.enum' => 'Movement kind must be receipt, adjustment, or transfer.',
        ]);

        try {
            $data = StoreInventoryMovementData::validateAndCreate([
                ...$request->all(),
                'kind' => $validated['kind'],
            ]);
        } catch (ValidationException $exception) {
            return Response::error(collect($exception->errors())->flatten()->implode(' '));
        }

        $movements = $service->apply($data, $user);

        return $this->json([
            'data' => InventoryMovementResource::collection(collect($movements))
                ->response()
                ->getData(true)['data'],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'kind' => $schema->string()
                ->description('Movement kind: receipt, adjustment, or transfer.')
                ->enum(['receipt', 'adjustment', 'transfer'])
                ->required(),
            'location_id' => $schema->integer()
                ->description('Target location for receipt or adjustment.'),
            'from_location_id' => $schema->integer()
                ->description('Source location for transfers.'),
            'to_location_id' => $schema->integer()
                ->description('Destination location for transfers.'),
            'product_id' => $schema->integer()
                ->description('Product being moved.')
                ->required(),
            'quantity' => $schema->integer()
                ->description('Quantity delta. Receipts/transfers: positive min 1. Adjustments: non-zero integer.')
                ->required(),
        ];
    }

    protected function permission(): string
    {
        return 'inventory.manage';
    }
}
