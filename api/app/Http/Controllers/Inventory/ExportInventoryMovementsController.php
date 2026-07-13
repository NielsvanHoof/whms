<?php

declare(strict_types=1);

namespace App\Http\Controllers\Inventory;

use App\Exports\InventoryMovementsExport;
use App\Http\Controllers\Controller;
use App\Models\InventoryMovement;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Excel as ExcelWriter;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

final class ExportInventoryMovementsController extends Controller
{
    private const int EXPORT_LIMIT = 10_000;

    /**
     * Download inventory movement history as CSV for the current tenant.
     */
    public function __invoke(Request $request): BinaryFileResponse
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

        return Excel::download(
            new InventoryMovementsExport($movements),
            $filename,
            ExcelWriter::CSV,
            ['Content-Type' => 'text/csv; charset=UTF-8'],
        );
    }
}
