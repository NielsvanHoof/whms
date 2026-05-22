import {
	appendListPage,
	type ListPageQuery,
} from "@/lib/api/list-query-params";
import { createBrowserAuthedClient } from "@/lib/auth";
import type { components, operations } from "@/lib/openapi/schema";

export type ProductsIndexQuery =
	operations["products.index"]["parameters"]["query"];
export type ProductsIndexResponse =
	operations["products.index"]["responses"]["200"]["content"]["application/json"];

export type ProductShowResponse =
	operations["products.show"]["responses"]["200"]["content"]["application/json"];

export type CreateProductRequestBody =
	components["schemas"]["StoreProductData"];
export type CreateProductResponse =
	operations["products.store"]["responses"]["200"]["content"]["application/json"];

export type UpdateProductRequestBody =
	components["schemas"]["UpdateProductData"];
export type UpdateProductResponse =
	operations["products.update"]["responses"]["200"]["content"]["application/json"];

function toProductsSearchParams(
	query: ProductsIndexQuery & ListPageQuery,
): URLSearchParams {
	const searchParams = new URLSearchParams();

	if (query?.["filter[name]"]) {
		searchParams.set("filter[name]", query["filter[name]"]);
	}
	if (query?.["filter[sku]"]) {
		searchParams.set("filter[sku]", query["filter[sku]"]);
	}
	if (query?.["filter[unit]"]) {
		searchParams.set("filter[unit]", query["filter[unit]"]);
	}
	if (query?.["filter[is_active]"]) {
		searchParams.set("filter[is_active]", query["filter[is_active]"]);
	}
	if (query?.sort?.length) {
		for (const sortValue of query.sort) {
			searchParams.append("sort[]", sortValue);
		}
	}
	appendListPage(searchParams, query);

	return searchParams;
}

export async function listProducts(
	query: ProductsIndexQuery & ListPageQuery = {},
): Promise<ProductsIndexResponse> {
	return createBrowserAuthedClient()
		.get("api/v1/products", {
			searchParams: toProductsSearchParams(query),
		})
		.json<ProductsIndexResponse>();
}

export async function showProduct(
	productId: number,
): Promise<ProductShowResponse> {
	return createBrowserAuthedClient()
		.get(`api/v1/products/${productId}`)
		.json<ProductShowResponse>();
}

export async function createProduct(
	body: CreateProductRequestBody,
): Promise<CreateProductResponse> {
	return createBrowserAuthedClient()
		.post("api/v1/products", { json: body })
		.json<CreateProductResponse>();
}

export async function updateProduct(
	productId: number,
	body: Omit<UpdateProductRequestBody, "product_id">,
): Promise<UpdateProductResponse> {
	return createBrowserAuthedClient()
		.put(`api/v1/products/${productId}`, {
			json: { ...body, product_id: productId },
		})
		.json<UpdateProductResponse>();
}

export async function deleteProduct(productId: number): Promise<void> {
	await createBrowserAuthedClient().delete(`api/v1/products/${productId}`);
}
