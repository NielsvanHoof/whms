import { type infer as Infer, z } from "zod";

/**
 * Client-side login validation. Matches API intent: required email (RFC-style),
 * required password. `device_name` is added only when calling the API.
 */
export const loginFormSchema = z.object({
	email: z.email().trim().min(1, "Enter your email"),
	password: z.string().min(1, "Enter your password"),
});

export type LoginFormValues = Infer<typeof loginFormSchema>;
