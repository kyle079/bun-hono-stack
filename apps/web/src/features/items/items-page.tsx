import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ItemForm } from "./item-form";
import { ItemsTable } from "./items-table";
import {
	type ItemRow,
	itemsQueryOptions,
	useCreateItem,
	useDeleteItem,
	useUpdateItem,
} from "./queries";

export function ItemsPage() {
	const { data: items } = useSuspenseQuery(itemsQueryOptions);
	const [editing, setEditing] = useState<ItemRow | null>(null);
	const createItem = useCreateItem();
	const updateItem = useUpdateItem();
	const deleteItem = useDeleteItem();

	return (
		<div className="container mx-auto grid max-w-4xl gap-6 px-4 py-6">
			<Card>
				<CardHeader>
					<CardTitle>{editing ? "Edit item" : "New item"}</CardTitle>
				</CardHeader>
				<CardContent>
					<ItemForm
						key={editing?.id ?? "new"}
						initialValues={editing ?? undefined}
						submitLabel={editing ? "Save" : "Create"}
						onCancel={editing ? () => setEditing(null) : undefined}
						onSubmit={async (json) => {
							try {
								if (editing) {
									await updateItem.mutateAsync({ id: editing.id, json });
									setEditing(null);
								} else {
									await createItem.mutateAsync(json);
								}
							} catch (error) {
								toast.error(
									error instanceof Error ? error.message : "Request failed",
								);
							}
						}}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Items</CardTitle>
				</CardHeader>
				<CardContent>
					<ItemsTable
						items={items}
						onEdit={setEditing}
						onDelete={(item) => deleteItem.mutate(item.id)}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
