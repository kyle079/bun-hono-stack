import { createMiddleware } from "hono/factory";

import { auth, type Session } from "../lib/auth";

export type SessionVariables = {
	user: Session["user"];
	session: Session["session"];
};

export const requireSession = createMiddleware<{ Variables: SessionVariables }>(
	async (c, next) => {
		const current = await auth.api.getSession({ headers: c.req.raw.headers });
		if (!current) {
			return c.json({ error: "Unauthorized" }, 401);
		}
		c.set("user", current.user);
		c.set("session", current.session);
		await next();
	},
);
