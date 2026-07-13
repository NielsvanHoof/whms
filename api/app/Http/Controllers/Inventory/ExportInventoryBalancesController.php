<?php

declare(strict_types=1);

namespace App\Http\Controllers\Inventory;

use App\Exports\InventoryBalancesExport;
use App\Http\Controllers\Controller;
use App\Models\InventoryBalance;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Excel as ExcelWriter;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

final class ExportInventoryBalancesController extends Controller
{
    private const int EXPORT_LIMIT = 10_000;

    /**
     * Download on-hand stock balances as CSV for the current tenant.
     */
    public function __invoke(Request $request): BinaryFileResponse
    {
        $this->authorize('viewAny', InventoryBalance::class);

        /**
         * @var Collection<int, InventoryBalance> $balances
         */
        $balances = QueryBuilder::for(InventoryBalance::class)
            ->allowedFilters(
                AllowedFilter::exact('warehouse_id'),
                AllowedFilter::exact('location_id'),
                AllowedFilter::exact('product_id'),
            )
            ->allowedSorts('id', 'quantity', 'created_at', 'updated_at')
            ->defaultSort('-id')
            ->with(['warehouse', 'location', 'product'])
            ->limit(self::EXPORT_LIMIT)
            ->get();

        $filename = 'inventory-balances-'.now()->format('Y-m-d-His').'.csv';

        return Excel::download(
            new InventoryBalancesExport($balances),
            $filename,
            ExcelWriter::CSV,
            ['Content-Type' => 'text/csv; charset=UTF-8'],
        );
    }
}
