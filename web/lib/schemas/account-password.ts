import { type infer as Infer, z } from "zod";

export const accountPasswordSchema = z
	.object({
		current_password: z.string().min(1, "Enter your current password"),
		password: z.string().min(8, "Use at least 8 characters"),
		password_confirmation: z.string().min(1, "Confirm your new password"),
	})
	.refine((values) => values.password === values.password_confirmation, {
		message: "Passwords do not match",
		path: ["password_confirmation"],
	});

export type AccountPasswordFormValues = Infer<typeof accountPasswordSchema>;
