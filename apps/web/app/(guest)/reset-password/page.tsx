import { ResetPasswordForm } from "@/components/login/reset-password-form";

type ResetPasswordPageProps = {
	searchParams: Promise<{
		email?: string;
		token?: string;
	}>;
};

export default async function ResetPasswordPage({
	searchParams,
}: ResetPasswordPageProps) {
	const params = await searchParams;

	return (
		<div className="flex min-h-svh items-center justify-center p-6">
			<ResetPasswordForm
				defaultEmail={params.email ?? ""}
				defaultToken={params.token ?? ""}
			/>
		</div>
	);
}
