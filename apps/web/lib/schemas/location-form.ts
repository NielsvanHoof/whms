import { type infer as Infer, z } from "zod";

export const locationFormSchema = z.object({
	warehouseId: z.number().int().min(1, "Choose a warehouse"),
	code: z.string().trim().min(1, "Enter a location code"),
	type: z.string().trim().min(1, "Enter a location type"),
});

export type LocationFormValues = Infer<typeof locationFormSchema>;
