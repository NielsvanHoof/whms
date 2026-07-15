import { type infer as Infer, z } from "zod";

export const forgotPasswordSchema = z.object({
	email: z.string().trim().email("Enter a valid email"),
});

export type ForgotPasswordFormValues = Infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
	.object({
		email: z.string().trim().email("Enter a valid email"),
		token: z.string().min(1, "Reset token is required"),
		password: z.string().min(8, "Password must be at least 8 characters"),
		passwordConfirmation: z.string().min(8, "Confirm the password"),
	})
	.refine((values) => values.password === values.passwordConfirmation, {
		message: "Passwords do not match",
		path: ["passwordConfirmation"],
	});

export type ResetPasswordFormValues = Infer<typeof resetPasswordSchema>;
