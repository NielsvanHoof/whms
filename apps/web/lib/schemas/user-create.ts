import { type infer as Infer, z } from "zod";

export const userCreateSchema = z
	.object({
		name: z.string().trim().min(1, "Enter a display name"),
		email: z.string().trim().email("Enter a valid email"),
		password: z.string().min(8, "Password must be at least 8 characters"),
		passwordConfirmation: z.string().min(8, "Confirm the password"),
		roles: z.array(z.string()).min(1, "Select at least one role"),
	})
	.refine((values) => values.password === values.passwordConfirmation, {
		message: "Passwords do not match",
		path: ["passwordConfirmation"],
	});

export type UserCreateFormValues = Infer<typeof userCreateSchema>;
