import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { toastApiError, toastSuccess } from "@/lib/toast";

type UseDeleteRowMutationOptions<TId extends string | number> = {
	deleteFn: (id: TId) => Promise<unknown>;
	invalidateQueryKey: readonly unknown[];
	successMessage: string;
	errorMessage: string;
};

export function useDeleteRowMutation<TId extends string | number>({
	deleteFn,
	invalidateQueryKey,
	successMessage,
	errorMessage,
}: UseDeleteRowMutationOptions<TId>) {
	const queryClient = useQueryClient();
	const [deletingId, setDeletingId] = useState<TId | null>(null);

	const mutation = useMutation({
		mutationFn: deleteFn,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: invalidateQueryKey });
			toastSuccess(successMessage);
		},
		onError: (error) => {
			void toastApiError(error, errorMessage);
		},
	});

	const deleteRow = async (id: TId) => {
		setDeletingId(id);
		try {
			await mutation.mutateAsync(id);
		} finally {
			setDeletingId(null);
		}
	};

	const isDeleting = (id: TId) => mutation.isPending && deletingId === id;

	return {
		deleteRow,
		isDeleting,
		isPending: mutation.isPending,
	};
}
