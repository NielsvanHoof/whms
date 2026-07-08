<?php

declare(strict_types=1);

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\InventoryMovement;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;
use Symfony\Component\HttpFoundation\StreamedResponse;

final class ExportInventoryMovementsController extends Controller
{
    private const int EXPORT_LIMIT = 10_000;

    /**
     * Stream inventory movement history as CSV for the current tenant.
     */
    public function __invoke(Request $request): StreamedResponse
    {
        $this->authorize('viewAny', InventoryMovement::class);

        /**
         * @var Collection<int, InventoryMovement> $movements
         */
        $movements = QueryBuilder::for(InventoryMovement::class)
            ->allowedFilters(
                AllowedFilter::exact('warehouse_id'),
                AllowedFilter::exact('location_id'),
                AllowedFilter::exact('product_id'),
                AllowedFilter::exact('kind'),
                AllowedFilter::exact('transfer_correlation_id'),
            )
            ->allowedSorts('id', 'created_at')
            ->defaultSort('-id')
            ->with(['warehouse', 'location', 'product'])
            ->limit(self::EXPORT_LIMIT)
            ->get();

        $filename = 'inventory-movements-'.now()->format('Y-m-d-His').'.csv';

        return response()->streamDownload(function () use ($movements): void {
            $handle = fopen('php://output', 'w');

            if ($handle === false) {
                return;
            }

            fputcsv($handle, [
                'id',
                'kind',
                'warehouse',
                'location',
                'product_sku',
                'product_name',
                'quantity_delta',
                'transfer_correlation_id',
                'created_at',
            ]);

            foreach ($movements as $movement) {
                fputcsv($handle, [
                    $movement->id,
                    (string) $movement->kind->value,
                    $movement->warehouse?->name,
                    $movement->location?->code,
                    $movement->product?->sku,
                    $movement->product?->name,
                    $movement->quantity_delta,
                    $movement->transfer_correlation_id,
                    $movement->created_at?->toIso8601String(),
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
