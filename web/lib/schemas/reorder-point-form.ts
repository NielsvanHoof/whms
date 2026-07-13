import { type infer as Infer, z } from "zod";

export const reorderPointFormSchema = z.object({
	productId: z.number().int().min(1, "Choose a product"),
	locationId: z.number().int().min(1, "Choose a location"),
	quantity: z.number().int().min(0, "Enter a quantity of 0 or more"),
});

export type ReorderPointFormValues = Infer<typeof reorderPointFormSchema>;
