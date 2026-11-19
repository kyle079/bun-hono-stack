import {
	createColumnHelper,
	tableFeatures,
	useTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import type { ItemRow } from "./queries";

const features = tableFeatures({});
const helper = createColumnHelper<typeof features, ItemRow>();

export function ItemsTable({
	items,
	onEdit,
	onDelete,
}: {
	items: ItemRow[];
	onEdit: (item: ItemRow) => void;
	onDelete: (item: ItemRow) => void;
}) {
	const columns = helper.columns([
		helper.accessor("name", { header: "Name" }),
		helper.accessor("status", { header: "Status" }),
		helper.accessor("notes", {
			header: "Notes",
			cell: (ctx) => ctx.getValue() ?? "",
		}),
		helper.display({
			id: "actions",
			cell: ({ row }) => (
				<div className="flex justify-end gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => onEdit(row.original)}
					>
						Edit
					</Button>
					<Button
						variant="destructive"
						size="sm"
						onClick={() => onDelete(row.original)}
					>
						Delete
					</Button>
				</div>
			),
		}),
	]);

	const table = useTable({ features, columns, data: items });

	return (
		<Table>
			<TableHeader>
				{table.getHeaderGroups().map((group) => (
					<TableRow key={group.id}>
						{group.headers.map((header) => (
							<TableHead key={header.id}>
								{header.isPlaceholder ? null : (
									<table.FlexRender header={header} />
								)}
							</TableHead>
						))}
					</TableRow>
				))}
			</TableHeader>
			<TableBody>
				{table.getRowModel().rows.map((row) => (
					<TableRow key={row.id}>
						{row.getAllCells().map((cell) => (
							<TableCell key={cell.id}>
								<table.FlexRender cell={cell} />
							</TableCell>
						))}
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
