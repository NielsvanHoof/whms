import type { ListPaginationQuery } from "@/lib/api/list-query-params";
import type { ProductsIndexQuery } from "@/lib/api/products";
import { deleteProduct } from "@/lib/api/products";
import { canManageProducts, canViewProducts } from "@/lib/permissions";
import {
	productQueryKeys,
	productsListQueryOptions,
} from "@/lib/queries/products";

import type { ListResource } from "./types";

export const productListResource = {
	title: "Products",
	description: "Manage product master data.",
	createHref: "/products/create",
	createLabel: "Create product",
	itemLabel: "product",
	loadingTitle: "Loading products",
	loadingDescription: "Fetching products for the current query.",
	errorTitle: "Could not load products",
	errorDescription: "The products list could not be fetched.",
	accessDeniedDescription: "You do not have permission to view products.",
	deleteSuccessMessage: "Product deleted",
	deleteErrorMessage: "Could not delete product.",
	canView: canViewProducts,
	canManage: canManageProducts,
	deleteFn: deleteProduct,
	invalidateQueryKey: productQueryKeys.all,
	listQueryOptions: productsListQueryOptions,
} satisfies ListResource<
	ProductsIndexQuery & ListPaginationQuery,
	typeof productsListQueryOptions
>;
