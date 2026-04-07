interface ProxyPayload {
    url: string;
    method?: string;
    headers?: Record<string, string>;
    body?: string;
}

const ALLOWED_HOSTS = new Set(["earsivportal.efatura.gov.tr", "earsivportaltest.efatura.gov.tr"]);

const BLOCKED_HEADERS = new Set(["host", "content-length", "connection"]);

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
    const payload = (await request.json()) as ProxyPayload;

    if (!payload?.url) {
        return new Response("Bad Request", { status: 400 });
    }

    let targetURL: URL;
    try {
        targetURL = new URL(payload.url);
    } catch {
        return new Response("Bad Request", { status: 400 });
    }

    if (targetURL.protocol !== "https:" || !ALLOWED_HOSTS.has(targetURL.hostname)) {
        return new Response("Forbidden", { status: 403 });
    }

    const method = (payload.method ?? "GET").toUpperCase();
    const headers = new Headers();

    if (payload.headers) {
        Object.entries(payload.headers).forEach(([key, value]) => {
            if (!BLOCKED_HEADERS.has(key.toLowerCase())) {
                headers.set(key, value);
            }
        });
    }

    const upstream = await fetch(targetURL.toString(), {
        method,
        headers,
        body: payload.body,
        redirect: "manual",
    });

    const responseHeaders = new Headers();
    const contentType = upstream.headers.get("content-type");
    const contentDisposition = upstream.headers.get("content-disposition");

    if (contentType) {
        responseHeaders.set("content-type", contentType);
    }

    if (contentDisposition) {
        responseHeaders.set("content-disposition", contentDisposition);
    }

    const text = await upstream.text();

    return new Response(text, {
        status: upstream.status,
        headers: responseHeaders,
    });
}
