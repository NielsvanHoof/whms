<?php

declare(strict_types=1);

namespace App\Models\Concerns;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * Scopes and fills tenant_id for models stored in the shared database.
 *
 * When a current tenant is set (HTTP API after middleware), queries are restricted
 * and new rows get the correct tenant_id automatically.
 */
trait BelongsToTenant
{
    public static function bootBelongsToTenant(): void
    {
        static::addGlobalScope('tenant', function (Builder $builder): void {
            if (Tenant::checkCurrent()) {
                $builder->where(
                    $builder->getModel()->getTable().'.tenant_id',
                    Tenant::current()->getKey()
                );
            }
        });

        static::creating(function (Model $model): void {
            if (Tenant::checkCurrent() && empty($model->getAttribute('tenant_id'))) {
                $model->setAttribute('tenant_id', Tenant::current()->getKey());
            }
        });
    }
}
