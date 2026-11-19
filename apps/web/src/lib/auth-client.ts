import { ssoClient } from "@better-auth/sso/client";
import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { serverUrl } from "./api";

export const authClient = createAuthClient({
	baseURL: serverUrl,
	plugins: [adminClient(), ssoClient()],
});
