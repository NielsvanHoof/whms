import { type infer as Infer, z } from "zod";

export const workspaceSettingsSchema = z.object({
	name: z.string().trim().min(1, "Enter a workspace name"),
	slug: z
		.string()
		.trim()
		.min(1, "Enter a slug")
		.regex(
			/^[a-zA-Z0-9_-]+$/,
			"Slug may only contain letters, numbers, dashes, and underscores",
		),
});

export type WorkspaceSettingsFormValues = Infer<typeof workspaceSettingsSchema>;
