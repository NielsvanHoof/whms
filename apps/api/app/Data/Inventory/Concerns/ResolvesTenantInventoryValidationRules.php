<?php

declare(strict_types=1);

namespace App\Data\Inventory\Concerns;

use App\Models\Tenant;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Exists;

trait ResolvesTenantInventoryValidationRules
{
    protected static function tenantLocationExistsRule(): Exists
    {
        $tenantId = Tenant::current()?->getKey();

        return Rule::exists('locations', 'id')->where(
            fn ($query) => $query->where('tenant_id', $tenantId)
        );
    }

    protected static function tenantProductExistsRule(): Exists
    {
        $tenantId = Tenant::current()?->getKey();

        return Rule::exists('products', 'id')->where(
            fn ($query) => $query->where('tenant_id', $tenantId)
        );
    }
}
