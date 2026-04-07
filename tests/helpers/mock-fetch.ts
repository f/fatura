import { vi } from "vitest";

/**
 * Creates a mock fetch function that returns the given response body once.
 */
export function mockFetchOnce(body: unknown): void {
  (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
  });
}

/**
 * Creates a sequence of mock responses for multiple fetch calls.
 */
export function mockFetchSequence(...bodies: unknown[]): void {
  for (const body of bodies) {
    mockFetchOnce(body);
  }
}

/**
 * Parses the Nth fetch call's URL and body, returning typed accessors.
 * Handles the `cmd=...&jp={encodeURIComponent(JSON.stringify(data))}` body format.
 */
export function getFetchCall(callIndex = 0): FetchCallSnapshot {
  const mockFn = globalThis.fetch as ReturnType<typeof vi.fn>;
  const call = mockFn.mock.calls[callIndex] as [string, RequestInit];
  const [url, init] = call;
  const body = (init?.body as string) ?? "";
  const params = new URLSearchParams(body);

  const jpRaw = params.get("jp");
  const jp: Record<string, unknown> = jpRaw ? JSON.parse(jpRaw) : {};

  return {
    url,
    method: init?.method ?? "GET",
    headers: init?.headers as Record<string, string>,
    rawBody: body,
    cmd: params.get("cmd") ?? "",
    callid: params.get("callid") ?? "",
    pageName: params.get("pageName") ?? "",
    token: params.get("token") ?? "",
    assoscmd: params.get("assoscmd") ?? "",
    jp,
  };
}

export interface FetchCallSnapshot {
  url: string;
  method: string;
  headers: Record<string, string>;
  rawBody: string;
  /** GIB command name — present in dispatch calls */
  cmd: string;
  callid: string;
  pageName: string;
  token: string;
  /** Login/logout command — present in assos-login calls */
  assoscmd: string;
  /** Decoded `jp` JSON payload */
  jp: Record<string, unknown>;
}
