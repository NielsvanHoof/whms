import { type infer as Infer, z } from "zod";

export const accountProfileSchema = z.object({
	name: z.string().trim().min(1, "Enter your name"),
});

export type AccountProfileFormValues = Infer<typeof accountProfileSchema>;
