<?php

declare(strict_types=1);

namespace App\Services;

use App\Data\Inventory\AdjustmentInventoryMovementData;
use App\Data\Inventory\ReceiptInventoryMovementData;
use App\Data\Inventory\StoreInventoryMovementData;
use App\Data\Inventory\TransferInventoryMovementData;
use App\Enums\InventoryMovementKind;
use App\Models\InventoryBalance;
use App\Models\InventoryMovement;
use App\Models\Location;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

/**
 * Applies inventory changes in a transaction: ledger rows plus balance updates.
 *
 * Row locks on balances prevent concurrent overselling from the same bin.
 */
final class ApplyInventoryMovementService
{
    /**
     * @return list<InventoryMovement>
     */
    public function apply(StoreInventoryMovementData $data, User $user): array
    {
        return match (true) {
            $data instanceof ReceiptInventoryMovementData => $this->applyReceipt($data, $user),
            $data instanceof AdjustmentInventoryMovementData => $this->applyAdjustment($data, $user),
            $data instanceof TransferInventoryMovementData => $this->applyTransfer($data, $user),
            default => throw new InvalidArgumentException('Unsupported inventory movement payload.'),
        };
    }

    /**
     * @return list<InventoryMovement>
     */
    private function applyReceipt(ReceiptInventoryMovementData $data, User $user): array
    {
        return DB::transaction(function () use ($data, $user): array {
            $location = Location::query()->findOrFail($data->location_id);
            $product = Product::query()->findOrFail($data->product_id);

            $movement = $this->persistMovement(
                InventoryMovementKind::Receipt,
                $location,
                $product,
                $data->quantity,
                null,
                $user,
            );
            $this->applyDeltaToBalance($location, $product, $data->quantity);

            return [$movement];
        });
    }

    /**
     * @return list<InventoryMovement>
     */
    private function applyAdjustment(AdjustmentInventoryMovementData $data, User $user): array
    {
        return DB::transaction(function () use ($data, $user): array {
            $location = Location::query()->findOrFail($data->location_id);
            $product = Product::query()->findOrFail($data->product_id);

            $movement = $this->persistMovement(
                InventoryMovementKind::Adjustment,
                $location,
                $product,
                $data->quantity,
                null,
                $user,
            );
            $this->applyDeltaToBalance($location, $product, $data->quantity);

            return [$movement];
        });
    }

    /**
     * @return list<InventoryMovement>
     */
    private function applyTransfer(TransferInventoryMovementData $data, User $user): array
    {
        return DB::transaction(function () use ($data, $user): array {
            $fromLocation = Location::query()->findOrFail($data->from_location_id);
            $toLocation = Location::query()->findOrFail($data->to_location_id);
            $product = Product::query()->findOrFail($data->product_id);

            if ((int) $fromLocation->warehouse_id !== (int) $toLocation->warehouse_id) {
                throw ValidationException::withMessages([
                    'to_location_id' => ['Transfers are only supported between locations in the same warehouse.'],
                ]);
            }

            $correlationId = (string) Str::uuid();

            $orderedLocations = $fromLocation->id < $toLocation->id
                ? [$fromLocation, $toLocation]
                : [$toLocation, $fromLocation];

            foreach ($orderedLocations as $location) {
                $this->lockAndLoadBalance($location, $product);
            }

            $this->applyDeltaToBalance($fromLocation, $product, -$data->quantity);
            $this->applyDeltaToBalance($toLocation, $product, $data->quantity);

            $out = $this->persistMovement(
                InventoryMovementKind::Transfer,
                $fromLocation,
                $product,
                -$data->quantity,
                $correlationId,
                $user,
            );
            $in = $this->persistMovement(
                InventoryMovementKind::Transfer,
                $toLocation,
                $product,
                $data->quantity,
                $correlationId,
                $user,
            );

            return [$out, $in];
        });
    }

    private function persistMovement(
        InventoryMovementKind $kind,
        Location $location,
        Product $product,
        int $quantityDelta,
        ?string $transferCorrelationId,
        User $user,
    ): InventoryMovement {
        return InventoryMovement::query()->create([
            'kind' => $kind,
            'warehouse_id' => $location->warehouse_id,
            'location_id' => $location->id,
            'product_id' => $product->id,
            'quantity_delta' => $quantityDelta,
            'transfer_correlation_id' => $transferCorrelationId,
            'user_id' => $user->id,
        ]);
    }

    /**
     * Locks the balance row (creating a zero row first if needed), then applies the delta.
     * Negative balances are rejected because they represent impossible physical stock.
     */
    private function applyDeltaToBalance(Location $location, Product $product, int $delta): void
    {
        $balance = $this->lockAndLoadBalance($location, $product);
        $newQuantity = (int) $balance->quantity + $delta;

        if ($newQuantity < 0) {
            throw ValidationException::withMessages([
                'quantity' => ['Insufficient quantity at the source location for the requested change.'],
            ]);
        }

        $balance->quantity = $newQuantity;
        $balance->save();
    }

    private function lockAndLoadBalance(Location $location, Product $product): InventoryBalance
    {
        $balance = InventoryBalance::query()
            ->where('location_id', $location->id)
            ->where('product_id', $product->id)
            ->lockForUpdate()
            ->first();

        if ($balance === null) {
            InventoryBalance::query()->create([
                'warehouse_id' => $location->warehouse_id,
                'location_id' => $location->id,
                'product_id' => $product->id,
                'quantity' => 0,
            ]);

            $balance = InventoryBalance::query()
                ->where('location_id', $location->id)
                ->where('product_id', $product->id)
                ->lockForUpdate()
                ->firstOrFail();
        }

        return $balance;
    }
}
