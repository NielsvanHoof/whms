import { type infer as Infer, z } from "zod";

export const productFormSchema = z.object({
	sku: z.string().trim().min(1, "Enter a SKU"),
	name: z.string().trim().min(1, "Enter a product name"),
	unit: z.string().trim().min(1, "Enter a unit"),
	isActive: z.boolean(),
});

export type ProductFormValues = Infer<typeof productFormSchema>;
