import { createFileRoute } from "@tanstack/react-router";

import { ItemsPage } from "@/features/items/items-page";
import { itemsQueryOptions } from "@/features/items/queries";

export const Route = createFileRoute("/_auth/items")({
	staticData: { title: "Items" },
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(itemsQueryOptions),
	component: ItemsPage,
});
