<?php

declare(strict_types=1);

namespace App\Exports;

use App\Models\InventoryBalance;
use Illuminate\Database\Eloquent\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

/**
 * @implements WithMapping<InventoryBalance>
 */
final class InventoryBalancesExport implements FromCollection, WithHeadings, WithMapping
{
    /**
     * @param  Collection<int, InventoryBalance>  $balances
     */
    public function __construct(
        private readonly Collection $balances,
    ) {}

    /**
     * @return Collection<int, InventoryBalance>
     */
    public function collection(): Collection
    {
        return $this->balances;
    }

    /**
     * @return list<string>
     */
    public function headings(): array
    {
        return [
            'id',
            'warehouse',
            'location',
            'product_sku',
            'product_name',
            'quantity',
            'updated_at',
        ];
    }

    /**
     * @param  InventoryBalance  $balance
     * @return list<int|string|null>
     */
    public function map($balance): array
    {
        return [
            $balance->id,
            $balance->warehouse?->name,
            $balance->location?->code,
            $balance->product?->sku,
            $balance->product?->name,
            $balance->quantity,
            $balance->updated_at?->toIso8601String(),
        ];
    }
}
