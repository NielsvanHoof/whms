import { ProductEditPageClient } from "@/components/products/product-edit-page-client";

type EditProductPageProps = {
	params: Promise<{ productId: string }>;
};

export default async function EditProductPage({
	params,
}: EditProductPageProps) {
	const { productId: productIdParam } = await params;
	const productId = Number.parseInt(productIdParam, 10);

	return (
		<ProductEditPageClient
			productId={Number.isFinite(productId) ? productId : null}
		/>
	);
}
