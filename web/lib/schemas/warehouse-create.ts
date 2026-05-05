import { type infer as Infer, z } from "zod";

/**
 * Client-side validation for warehouse creation.
 * Name is required. Code is optional.
 */
export const warehouseCreateSchema = z.object({
	name: z.string().trim().min(1, "Enter a warehouse name"),
	code: z.string().trim(),
});

export type WarehouseCreateFormValues = Infer<typeof warehouseCreateSchema>;
