<?php

declare(strict_types=1);

namespace App\Data\Tenant;

use App\Models\Tenant;
use Illuminate\Validation\Rule;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;
use Spatie\LaravelData\Support\Validation\ValidationContext;

final class UpdateTenantData extends Data
{
    public function __construct(
        public string|Optional $name,
        public string|Optional $slug,
    ) {}

    /**
     * @return array<string, array<int, mixed>>
     */
    public static function rules(?ValidationContext $context = null): array
    {
        $tenantId = Tenant::current()?->getKey();

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => [
                'sometimes',
                'string',
                'max:255',
                'alpha_dash',
                Rule::unique('tenants', 'slug')->ignore($tenantId),
            ],
        ];
    }

    /**
     * @return array{name?: string, slug?: string}
     */
    public function toModelAttributes(): array
    {
        $attributes = [];

        if (! $this->name instanceof Optional) {
            $attributes['name'] = $this->name;
        }

        if (! $this->slug instanceof Optional) {
            $attributes['slug'] = $this->slug;
        }

        return $attributes;
    }
}
