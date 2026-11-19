import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	return (
		<div className="container mx-auto max-w-3xl px-4 py-6">
			<Link to="/items" className="underline">
				Go to items
			</Link>
		</div>
	);
}
