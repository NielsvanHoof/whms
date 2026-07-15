<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\TenantFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Multitenancy\Models\Tenant as SpatieTenant;

/**
 * Tenant (customer organization) for single-database multitenancy.
 *
 * We do not use a separate physical database per tenant. Spatie still expects
 * {@see getDatabaseName()} for its contract; we return the default connection database name.
 */
#[Fillable(['name', 'slug'])]
final class Tenant extends SpatieTenant
{
    /** @use HasFactory<TenantFactory> */
    use HasFactory;

    /**
     * Logical database name for Spatie tasks; all tenants share the default connection.
     */
    public function getDatabaseName(): string
    {
        $connection = config('database.default');
        $database = config("database.connections.{$connection}.database");

        return $database !== null ? (string) $database : '';
    }

    /**
     * @return HasMany<User, $this>
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * @return HasMany<Warehouse, $this>
     */
    public function warehouses(): HasMany
    {
        return $this->hasMany(Warehouse::class);
    }

    /**
     * @return HasMany<Product, $this>
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * @return HasMany<Location, $this>
     */
    public function locations(): HasMany
    {
        return $this->hasMany(Location::class);
    }

    protected static function newFactory(): TenantFactory
    {
        return TenantFactory::new();
    }
}
