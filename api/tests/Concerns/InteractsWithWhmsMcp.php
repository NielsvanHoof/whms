<?php

declare(strict_types=1);

namespace Tests\Concerns;

use App\Models\Tenant;
use App\Models\User;

trait InteractsWithWhmsMcp
{
    /**
     * @return array{tenant: Tenant, user: User}
     */
    protected function actingAsTenantUser(string $role = 'manager'): array
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $this->assignRole($user, $role);
        $tenant->makeCurrent();

        return ['tenant' => $tenant, 'user' => $user];
    }
}
