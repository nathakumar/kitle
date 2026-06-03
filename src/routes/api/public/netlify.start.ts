import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Kicks off the Netlify OAuth Authorization Code flow.
 * The browser opens this URL in a popup; we 302 to Netlify.
 */
export const Route = createFileRoute("/api/public/netlify/start")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const clientId = process.env.NETLIFY_CLIENT_ID;
        if (!clientId) {
          return new Response("NETLIFY_CLIENT_ID is not configured", { status: 500 });
        }
        const url = new URL(request.url);
        const origin = `${url.protocol}//${url.host}`;
        const redirectUri = `${origin}/api/public/netlify/callback`;
        const state = crypto.randomUUID();

        const authorize = new URL("https://app.netlify.com/authorize");
        authorize.searchParams.set("client_id", clientId);
        authorize.searchParams.set("response_type", "code");
        authorize.searchParams.set("redirect_uri", redirectUri);
        authorize.searchParams.set("state", state);

        return new Response(null, {
          status: 302,
          headers: {
            Location: authorize.toString(),
            "Set-Cookie": `nf_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
          },
        });
      },
    },
  },
});
