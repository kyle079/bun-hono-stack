import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { sso } from "@better-auth/sso";
import * as schema from "@bun-hono-stack/db/schema/auth";
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";

import { db } from "./db";
import { ENV } from "./env";

const oidcConfigured =
	ENV.SSO_DOMAIN &&
	ENV.SSO_ISSUER &&
	ENV.SSO_CLIENT_ID &&
	ENV.SSO_CLIENT_SECRET;

export const auth = betterAuth({
	database: drizzleAdapter(db, { provider: "pg", schema }),
	trustedOrigins: [ENV.CORS_ORIGIN],
	emailAndPassword: { enabled: true },
	secret: ENV.BETTER_AUTH_SECRET,
	baseURL: ENV.BETTER_AUTH_URL,
	advanced: {
		defaultCookieAttributes: {
			sameSite: "none",
			secure: true,
			httpOnly: true,
		},
	},
	plugins: [
		admin(),
		sso({
			defaultSSO: oidcConfigured
				? [
						{
							providerId: ENV.SSO_PROVIDER_ID || "oidc",
							domain: ENV.SSO_DOMAIN as string,
							oidcConfig: {
								issuer: ENV.SSO_ISSUER as string,
								discoveryEndpoint: `${ENV.SSO_ISSUER}/.well-known/openid-configuration`,
								pkce: true,
								clientId: ENV.SSO_CLIENT_ID as string,
								clientSecret: ENV.SSO_CLIENT_SECRET as string,
							},
						},
					]
				: [],
		}),
	],
});

export type Session = typeof auth.$Infer.Session;
