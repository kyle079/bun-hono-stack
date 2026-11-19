import { beforeEach, expect, mock, test } from "bun:test";

const getSession = mock(async (): Promise<unknown> => null);

mock.module("../lib/auth", () => ({ auth: { api: { getSession } } }));
mock.module("../lib/db", () => ({ db: {} }));

const { itemsRoute } = await import("./items");

const signedIn = { user: { id: "user-1" }, session: { id: "session-1" } };
const jsonBody = (body: unknown) => ({
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify(body),
});

beforeEach(() => {
	getSession.mockReset();
});

test("returns 401 without a session", async () => {
	getSession.mockResolvedValue(null);
	const res = await itemsRoute.request("/");
	expect(res.status).toBe(401);
});

test("returns 400 for an invalid create body", async () => {
	getSession.mockResolvedValue(signedIn);
	const res = await itemsRoute.request("/", jsonBody({ name: "" }));
	expect(res.status).toBe(400);
});

test("returns 400 for a non-uuid id", async () => {
	getSession.mockResolvedValue(signedIn);
	const res = await itemsRoute.request("/not-a-uuid");
	expect(res.status).toBe(400);
});
