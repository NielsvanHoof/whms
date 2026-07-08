import { deleteProduct } from "@/lib/api/products";
import {
	canManageProducts,
	canViewProducts,
	type PermissionKey,
} from "@/lib/permissions";
import {
	productQueryKeys,
	productsListQueryOptions,
} from "@/lib/queries/products";

export const productListResource = {
	title: "Products",
	description: "Manage product master data.",
	createHref: "/products/create",
	createLabel: "Create product",
	itemLabel: "product",
	loadingTitle: "Loading products",
	errorTitle: "Could not load products",
	accessDeniedDescription: "You do not have permission to view products.",
	deleteSuccessMessage: "Product deleted",
	deleteErrorMessage: "Could not delete product.",
	canView: canViewProducts,
	canManage: canManageProducts,
	deleteFn: deleteProduct,
	invalidateQueryKey: productQueryKeys.all,
	listQueryOptions: productsListQueryOptions,
} satisfies {
	title: string;
	description: string;
	createHref: string;
	createLabel: string;
	itemLabel: string;
	loadingTitle: string;
	errorTitle: string;
	accessDeniedDescription: string;
	deleteSuccessMessage: string;
	deleteErrorMessage: string;
	canView: (permissions: readonly PermissionKey[] | undefined) => boolean;
	canManage: (permissions: readonly PermissionKey[] | undefined) => boolean;
	deleteFn: (id: number) => Promise<void>;
	invalidateQueryKey: readonly unknown[];
	listQueryOptions: typeof productsListQueryOptions;
};
