import { Link, type LinkProps, useMatchRoute } from "@tanstack/react-router";
import { ChevronRightIcon, type LucideIcon } from "lucide-react";

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar";

type NavTarget = { title: string; to: LinkProps["to"] };

export type NavItem = NavTarget & {
	icon: LucideIcon;
	items?: NavTarget[];
};

export function NavMain({ items }: { items: NavItem[] }) {
	const matchRoute = useMatchRoute();
	const isActive = (to: LinkProps["to"]) =>
		Boolean(matchRoute({ to, fuzzy: true }));

	return (
		<SidebarGroup>
			<SidebarMenu>
				{items.map((item) =>
					item.items ? (
						<Collapsible
							key={item.title}
							defaultOpen={item.items.some((child) => isActive(child.to))}
							className="group/collapsible"
							render={<SidebarMenuItem />}
						>
							<CollapsibleTrigger
								render={<SidebarMenuButton tooltip={item.title} />}
							>
								<item.icon />
								<span>{item.title}</span>
								<ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
							</CollapsibleTrigger>
							<CollapsibleContent>
								<SidebarMenuSub>
									{item.items.map((child) => (
										<SidebarMenuSubItem key={child.title}>
											<SidebarMenuSubButton
												isActive={isActive(child.to)}
												render={<Link to={child.to} />}
											>
												<span>{child.title}</span>
											</SidebarMenuSubButton>
										</SidebarMenuSubItem>
									))}
								</SidebarMenuSub>
							</CollapsibleContent>
						</Collapsible>
					) : (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton
								tooltip={item.title}
								isActive={isActive(item.to)}
								render={<Link to={item.to} />}
							>
								<item.icon />
								<span>{item.title}</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					),
				)}
			</SidebarMenu>
		</SidebarGroup>
	);
}
