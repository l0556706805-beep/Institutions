// Cloudflare Pages Function: proxy /api/* -> Render backend
//
// NOTE: This file is intentionally under `frontend/functions/` because
// Cloudflare Pages is configured to build/deploy from the `frontend` directory.
// Keeping it here ensures Pages deploys this Function.

export async function onRequest(context: any) {
  const { request } = context;

  // OPTIONS preflight (safe even though most calls are same-origin)
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        "Access-Control-Allow-Headers":
          request.headers.get("Access-Control-Request-Headers") || "*",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  const incomingUrl = new URL(request.url);

  // Extract path after /api (e.g., /api/auth/login -> /auth/login)
  const pathAfterApi = incomingUrl.pathname.replace(/^\/api/, "") || "/";
  
  // Build upstream URL to Render backend
  const upstreamUrl = new URL(`https://institutions-93gl.onrender.com/api${pathAfterApi}`);
  upstreamUrl.search = incomingUrl.search; // Preserve query params

  // Copy headers but drop ones that can confuse upstream
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("origin");
  headers.delete("referer");

  // Clone request body for POST/PUT/PATCH requests
  let body: ReadableStream | null = null;
  if (request.method !== "GET" && request.method !== "HEAD") {
    body = request.body;
  }

  const upstreamRequest = new Request(upstreamUrl.toString(), {
    method: request.method,
    headers,
    body: body,
    redirect: "manual",
  });

  const upstreamResponse = await fetch(upstreamRequest);

  // Return response as-is
  const respHeaders = new Headers(upstreamResponse.headers);
  respHeaders.set("Cache-Control", "no-store");

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: respHeaders,
  });
}

