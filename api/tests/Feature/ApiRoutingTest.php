<?php

declare(strict_types=1);

namespace Tests\Feature;

use Tests\TestCase;

final class ApiRoutingTest extends TestCase
{
    /**
     * Versioned API health endpoint is reachable under /api/v1.
     */
    public function test_api_v1_health_returns_json_ok(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertOk()
            ->assertHeader('content-type', 'application/json')
            ->assertJson(['status' => 'ok']);
    }

    /**
     * JSON clients should receive JSON for not found under the API prefix.
     */
    public function test_api_unknown_route_returns_json_when_requested_as_json(): void
    {
        $response = $this->getJson('/api/v1/does-not-exist');

        $response->assertNotFound()
            ->assertHeader('content-type', 'application/json');
    }
}
