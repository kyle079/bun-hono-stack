import {
	itemInsertSchema,
	itemStatuses,
} from "@bun-hono-stack/db/schema/items";
import { useForm } from "@tanstack/react-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ItemFormValues = z.input<typeof itemInsertSchema>;

const emptyValues: ItemFormValues = { name: "", notes: "", status: "draft" };

export function ItemForm({
	initialValues = emptyValues,
	submitLabel,
	onSubmit,
	onCancel,
}: {
	initialValues?: ItemFormValues;
	submitLabel: string;
	onSubmit: (values: z.output<typeof itemInsertSchema>) => Promise<unknown>;
	onCancel?: () => void;
}) {
	const form = useForm({
		defaultValues: initialValues,
		validators: { onSubmit: itemInsertSchema },
		onSubmit: async ({ value }) => {
			await onSubmit(itemInsertSchema.parse(value));
			form.reset();
		},
	});

	return (
		<form
			className="space-y-4"
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
		>
			<form.Field name="name">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor={field.name}>Name</Label>
						<Input
							id={field.name}
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
						{field.state.meta.errors.map((error) => (
							<p key={error?.message} className="text-destructive text-sm">
								{error?.message}
							</p>
						))}
					</div>
				)}
			</form.Field>

			<form.Field name="status">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor={field.name}>Status</Label>
						<select
							id={field.name}
							className="border-input bg-background h-8 w-full border px-2 text-sm"
							value={field.state.value}
							onChange={(e) =>
								field.handleChange(
									e.target.value as (typeof itemStatuses)[number],
								)
							}
						>
							{itemStatuses.map((status) => (
								<option key={status} value={status}>
									{status}
								</option>
							))}
						</select>
					</div>
				)}
			</form.Field>

			<form.Field name="notes">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor={field.name}>Notes</Label>
						<Textarea
							id={field.name}
							value={field.state.value ?? ""}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
					</div>
				)}
			</form.Field>

			<div className="flex gap-2">
				<form.Subscribe selector={(state) => state.isSubmitting}>
					{(isSubmitting) => (
						<Button type="submit" disabled={isSubmitting}>
							{submitLabel}
						</Button>
					)}
				</form.Subscribe>
				{onCancel ? (
					<Button type="button" variant="outline" onClick={onCancel}>
						Cancel
					</Button>
				) : null}
			</div>
		</form>
	);
}
