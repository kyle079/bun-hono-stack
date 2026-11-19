import { Link } from "@tanstack/react-router";

import { buttonVariants } from "@/components/ui/button";

import { ModeToggle } from "./mode-toggle";

export function Header() {
	return (
		<header className="flex items-center justify-between border-b px-4 py-2">
			<Link to="/" className="font-medium">
				bun-hono-stack
			</Link>
			<div className="flex items-center gap-2">
				<ModeToggle />
				<Link to="/login" className={buttonVariants({ variant: "outline" })}>
					Sign in
				</Link>
			</div>
		</header>
	);
}
