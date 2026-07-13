<?php

declare(strict_types=1);

namespace App\Exports;

use App\Models\InventoryMovement;
use Illuminate\Database\Eloquent\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

final class InventoryMovementsExport implements FromCollection, WithHeadings, WithMapping
{
    /**
     * @param  Collection<int, InventoryMovement>  $movements
     */
    public function __construct(
        private readonly Collection $movements,
    ) {}

    /**
     * @return Collection<int, InventoryMovement>
     */
    public function collection(): Collection
    {
        return $this->movements;
    }

    /**
     * @return list<string>
     */
    public function headings(): array
    {
        return [
            'id',
            'kind',
            'warehouse',
            'location',
            'product_sku',
            'product_name',
            'quantity_delta',
            'transfer_correlation_id',
            'created_at',
        ];
    }

    /**
     * @param  InventoryMovement  $movement
     * @return list<int|string|null>
     */
    public function map($movement): array
    {
        return [
            $movement->id,
            $movement->getRawOriginal('kind'),
            $movement->warehouse?->name,
            $movement->location?->code,
            $movement->product?->sku,
            $movement->product?->name,
            $movement->quantity_delta,
            $movement->transfer_correlation_id,
            $movement->created_at?->toIso8601String(),
        ];
    }
}
