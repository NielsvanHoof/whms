<?php

declare(strict_types=1);

namespace App\Mcp\Concerns;

use Illuminate\Http\Request as HttpRequest;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Pagination\LengthAwarePaginator;
use Laravel\Mcp\Response;

/**
 * Serializes API resources into JSON MCP tool/resource responses.
 */
trait EncodesMcpJson
{
    /**
     * @param  array<string, mixed>  $data
     */
    protected function json(array $data): Response
    {
        return Response::text(json_encode($data, JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT));
    }

    protected function jsonResource(JsonResource $resource): Response
    {
        return $this->json($resource->resolve(HttpRequest::create('/')));
    }

    /**
     * @param  LengthAwarePaginator<int, mixed>  $paginator
     * @param  class-string<JsonResource>  $resourceClass
     */
    protected function jsonPaginatedResource(LengthAwarePaginator $paginator, string $resourceClass): Response
    {
        return $this->json($resourceClass::collection($paginator)->response()->getData(true));
    }
}
