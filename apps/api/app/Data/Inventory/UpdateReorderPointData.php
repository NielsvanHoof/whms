<?php

declare(strict_types=1);

namespace App\Data\Inventory;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

final class UpdateReorderPointData extends Data
{
    public function __construct(
        public int $quantity,
        public int $reorder_point_id,
    ) {}

    /**
     * @return array<string, array<int, mixed>>
     */
    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'quantity' => ['required', 'integer', 'min:0'],
            'reorder_point_id' => ['required', 'integer'],
        ];
    }

    /**
     * @return array{quantity: int}
     */
    public function toModelAttributes(): array
    {
        return [
            'quantity' => $this->quantity,
        ];
    }
}
