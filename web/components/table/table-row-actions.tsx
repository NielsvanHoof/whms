import { PencilIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";

import { DeleteConfirmDialog } from "@/components/confirm/delete-confirm-dialog";
import { Button } from "@/components/ui/button";

type TableRowActionsProps = {
	canEdit?: boolean;
	canDelete?: boolean;
	editHref?: string;
	editLabel?: string;
	deleteTitle: string;
	deleteDescription: React.ReactNode;
	isDeletePending?: boolean;
	onDelete: () => Promise<void>;
};

export function TableRowActions({
	canEdit = false,
	canDelete = false,
	editHref,
	editLabel = "Edit",
	deleteTitle,
	deleteDescription,
	isDeletePending = false,
	onDelete,
}: TableRowActionsProps) {
	if (!canEdit && !canDelete) {
		return null;
	}

	return (
		<div className="flex justify-end gap-2">
			{canEdit && editHref ? (
				<Button asChild size="sm" variant="outline">
					<Link href={editHref}>
						<PencilIcon data-icon="inline-start" />
						{editLabel}
					</Link>
				</Button>
			) : null}
			{canDelete ? (
				<DeleteConfirmDialog
					description={deleteDescription}
					isPending={isDeletePending}
					onConfirm={onDelete}
					title={deleteTitle}
					trigger={
						<Button
							disabled={isDeletePending}
							size="sm"
							type="button"
							variant="outline"
						>
							<Trash2Icon data-icon="inline-start" />
							Delete
						</Button>
					}
				/>
			) : null}
		</div>
	);
}
