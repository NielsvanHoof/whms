"use client";

import { useState } from "react";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type DeleteConfirmDialogProps = {
	/** Button or control that opens the dialog. */
	trigger: React.ReactNode;
	title: string;
	description: React.ReactNode;
	/** Label for the destructive confirm button. */
	confirmLabel?: string;
	onConfirm: () => void | Promise<void>;
	isPending?: boolean;
};

/**
 * Replaces `window.confirm` with a shadcn AlertDialog for destructive actions.
 */
export function DeleteConfirmDialog({
	trigger,
	title,
	description,
	confirmLabel = "Delete",
	onConfirm,
	isPending = false,
}: DeleteConfirmDialogProps) {
	const [open, setOpen] = useState(false);

	async function handleConfirm(event: React.MouseEvent<HTMLButtonElement>) {
		event.preventDefault();
		try {
			await onConfirm();
			setOpen(false);
		} catch {
			// Keep the dialog open; caller should show a toast for the error.
		}
	}

	return (
		<AlertDialog onOpenChange={setOpen} open={open}>
			<AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						className={cn(
							"bg-destructive text-white hover:bg-destructive/90",
							"focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
						)}
						disabled={isPending}
						onClick={(event) => {
							void handleConfirm(event);
						}}
					>
						{isPending ? (
							<Spinner
								aria-hidden
								className="size-4"
								data-icon="inline-start"
							/>
						) : null}
						{confirmLabel}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
