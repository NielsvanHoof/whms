import { queryOptions } from "@tanstack/react-query";

import type { ListPageQuery } from "@/lib/api/list-query-params";
import {
	listProducts,
	type ProductsIndexQuery,
	showProduct,
} from "@/lib/api/products";

export const productQueryKeys = {
	all: ["products"] as const,
	list: (query: ProductsIndexQuery & ListPageQuery) =>
		[...productQueryKeys.all, "list", query] as const,
	detail: (productId: number) =>
		[...productQueryKeys.all, "detail", productId] as const,
};

export function productsListQueryOptions(
	query: ProductsIndexQuery & ListPageQuery = {},
) {
	return queryOptions({
		queryKey: productQueryKeys.list(query),
		queryFn: () => listProducts(query),
	});
}

export function productDetailQueryOptions(productId: number) {
	return queryOptions({
		queryKey: productQueryKeys.detail(productId),
		queryFn: () => showProduct(productId),
	});
}
