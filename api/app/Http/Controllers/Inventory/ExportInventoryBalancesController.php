<?php

declare(strict_types=1);

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\InventoryBalance;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;
use Symfony\Component\HttpFoundation\StreamedResponse;

final class ExportInventoryBalancesController extends Controller
{
    private const int EXPORT_LIMIT = 10_000;

    /**
     * Stream on-hand stock balances as CSV for the current tenant.
     */
    public function __invoke(Request $request): StreamedResponse
    {
        $this->authorize('viewAny', InventoryBalance::class);

        $balances = QueryBuilder::for(InventoryBalance::class)
            ->with(['warehouse', 'location', 'product'])
            ->allowedFilters(
                AllowedFilter::exact('warehouse_id'),
                AllowedFilter::exact('location_id'),
                AllowedFilter::exact('product_id'),
            )
            ->allowedSorts('id', 'quantity', 'created_at', 'updated_at')
            ->defaultSort('-id')
            ->limit(self::EXPORT_LIMIT)
            ->get();

        $filename = 'inventory-balances-'.now()->format('Y-m-d-His').'.csv';

        return response()->streamDownload(function () use ($balances): void {
            $handle = fopen('php://output', 'w');

            if ($handle === false) {
                return;
            }

            fputcsv($handle, [
                'id',
                'warehouse',
                'location',
                'product_sku',
                'product_name',
                'quantity',
                'updated_at',
            ]);

            foreach ($balances as $balance) {
                fputcsv($handle, [
                    $balance->id,
                    $balance->warehouse?->name,
                    $balance->location?->code,
                    $balance->product?->sku,
                    $balance->product?->name,
                    $balance->quantity,
                    $balance->updated_at?->toIso8601String(),
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
