<?php

namespace App\Data\Warehouse;

use App\Models\Tenant;
use Illuminate\Validation\Rule;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class StoreWarehouseData extends Data
{
    public function __construct(
        public string $name,
        public ?string $code,
    ) {}

    /**
     * @return array<string, array<int, (\Closure(string):void)|string>>
     */
    public static function rules(?ValidationContext $context = null): array
    {
        $tenantId = Tenant::current()?->getKey();

        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => [
                'nullable',
                'string',
                'max:64',
                Rule::unique('warehouses', 'code')->where(
                    fn ($query) => $query->where('tenant_id', $tenantId)
                ),
            ],
        ];
    }

    /**
     * @return array{name: string, code: ?string}
     */
    public function toModelAttributes(): array
    {
        return [
            'name' => $this->name,
            'code' => $this->code,
        ];
    }
}
