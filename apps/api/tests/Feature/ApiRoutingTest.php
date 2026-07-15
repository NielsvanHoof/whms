<?php

declare(strict_types=1);

it('returns json ok from api v1 health endpoint', function () {
    $response = $this->getJson('/api/v1/health');

    $response->assertOk()
        ->assertHeader('content-type', 'application/json')
        ->assertJson(['status' => 'ok']);
});

it('returns json for unknown api route when requested as json', function () {
    $response = $this->getJson('/api/v1/does-not-exist');

    $response->assertNotFound()
        ->assertHeader('content-type', 'application/json');
});
