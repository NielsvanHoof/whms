<?php

namespace App\Data\Warehouse;

use App\Models\Tenant;
use Illuminate\Validation\Rule;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class UpdateWarehouseData extends Data
{
    public function __construct(
        public string|Optional $name,
        public string|Optional|null $code,
        public int $warehouse_id,
    ) {}

    /**
     * @return array<string, array<int, (\Closure(string):void)|string>>
     */
    public static function rules(?ValidationContext $context = null): array
    {
        $tenantId = Tenant::current()?->getKey();
        $warehouseId = (int) ($context->fullPayload['warehouse_id'] ?? 0);

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'code' => [
                'sometimes',
                'nullable',
                'string',
                'max:64',
                Rule::unique('warehouses', 'code')
                    ->where(fn ($query) => $query->where('tenant_id', $tenantId))
                    ->ignore($warehouseId),
            ],
            'warehouse_id' => ['required', 'integer'],
        ];
    }

    /**
     * @return array{name?: string, code?: ?string}
     */
    public function toModelAttributes(): array
    {
        $attributes = [];

        if (! $this->name instanceof Optional) {
            $attributes['name'] = $this->name;
        }

        if (! $this->code instanceof Optional) {
            $attributes['code'] = $this->code;
        }

        return $attributes;
    }
}
