import { useMatches } from "@tanstack/react-router";
import { Fragment } from "react";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function PageBreadcrumb() {
	const titles = useMatches({
		select: (matches) =>
			matches.flatMap((match) => match.staticData.title ?? []),
	});

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{titles.map((title, index) => (
					<Fragment key={title}>
						{index > 0 ? <BreadcrumbSeparator /> : null}
						<BreadcrumbItem>
							{index === titles.length - 1 ? (
								<BreadcrumbPage>{title}</BreadcrumbPage>
							) : (
								title
							)}
						</BreadcrumbItem>
					</Fragment>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
