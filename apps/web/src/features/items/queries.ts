import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import type { InferRequestType, InferResponseType } from "hono/client";

import { api } from "@/lib/api";

export type ItemRow = InferResponseType<typeof api.api.items.$get, 200>[number];
export type CreateItemInput = InferRequestType<
	typeof api.api.items.$post
>["json"];
export type UpdateItemInput = InferRequestType<
	(typeof api.api.items)[":id"]["$patch"]
>["json"];

export const itemsQueryOptions = queryOptions({
	queryKey: ["items"],
	queryFn: async () => {
		const res = await api.api.items.$get();
		if (!res.ok) throw new Error("Failed to load items");
		return res.json();
	},
});

export function useCreateItem() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (json: CreateItemInput) => {
			const res = await api.api.items.$post({ json });
			if (!res.ok) throw new Error("Failed to create item");
			return res.json();
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: itemsQueryOptions.queryKey }),
	});
}

export function useUpdateItem() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, json }: { id: string; json: UpdateItemInput }) => {
			const res = await api.api.items[":id"].$patch({ param: { id }, json });
			if (!res.ok) throw new Error("Failed to update item");
			return res.json();
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: itemsQueryOptions.queryKey }),
	});
}

export function useDeleteItem() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const res = await api.api.items[":id"].$delete({ param: { id } });
			if (!res.ok) throw new Error("Failed to delete item");
			return res.json();
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: itemsQueryOptions.queryKey }),
	});
}
