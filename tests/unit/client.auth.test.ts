import { describe, it, expect, vi, beforeEach } from "vitest";
import { FaturaClient } from "../../src/index";
import { ENV } from "../../src/constants/environment";
import { mockFetchOnce, getFetchCall } from "../helpers/mock-fetch";

describe("FaturaClient — auth", () => {
    let prodClient: FaturaClient;
    let testClient: FaturaClient;

    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
        prodClient = new FaturaClient("PROD");
        testClient = new FaturaClient("TEST");
    });

    // ─── getToken ──────────────────────────────────────────────────────────────

    describe("getToken", () => {
        it("returns the token from the JSON response", async () => {
            mockFetchOnce({ token: "session-abc" });
            const result = await prodClient.getToken("user123", "pass456");
            expect(result).toBe("session-abc");
        });

        it("calls the assos-login endpoint", async () => {
            mockFetchOnce({ token: "t" });
            await prodClient.getToken("u", "p");
            const call = getFetchCall();
            expect(call.url).toBe(`${ENV.PROD.BASE_URL}/earsiv-services/assos-login`);
        });

        it("uses POST method", async () => {
            mockFetchOnce({ token: "t" });
            await prodClient.getToken("u", "p");
            expect(getFetchCall().method).toBe("POST");
        });

        it("PROD: sends assoscmd=anologin", async () => {
            mockFetchOnce({ token: "t" });
            await prodClient.getToken("u", "p");
            expect(getFetchCall().assoscmd).toBe("anologin");
        });

        it("TEST: sends assoscmd=login", async () => {
            mockFetchOnce({ token: "t" });
            await testClient.getToken("u", "p");
            expect(getFetchCall().assoscmd).toBe("login");
        });

        it("sends userid in the body", async () => {
            mockFetchOnce({ token: "t" });
            await prodClient.getToken("myUser", "myPass");
            const { rawBody } = getFetchCall();
            expect(rawBody).toContain("userid=myUser");
        });

        it("sends sifre and sifre2 in the body", async () => {
            mockFetchOnce({ token: "t" });
            await prodClient.getToken("u", "secret123");
            const { rawBody } = getFetchCall();
            expect(rawBody).toContain("sifre=secret123");
            expect(rawBody).toContain("sifre2=secret123");
        });

        it("sends rtype=json", async () => {
            mockFetchOnce({ token: "t" });
            await prodClient.getToken("u", "p");
            expect(getFetchCall().rawBody).toContain("rtype=json");
        });

        it("uses TEST base URL when env is TEST", async () => {
            mockFetchOnce({ token: "t" });
            await testClient.getToken("u", "p");
            expect(getFetchCall().url).toBe(`${ENV.TEST.BASE_URL}/earsiv-services/assos-login`);
        });

        it("sends content-type header as form-urlencoded", async () => {
            mockFetchOnce({ token: "t" });
            await prodClient.getToken("u", "p");
            const { headers } = getFetchCall();
            expect((headers as Record<string, string>)["content-type"]).toContain("application/x-www-form-urlencoded");
        });
    });

    // ─── logout ────────────────────────────────────────────────────────────────

    describe("logout", () => {
        it("returns the redirect URL from response.data", async () => {
            mockFetchOnce({ data: "https://earsivportal.efatura.gov.tr/login.jsp" });
            const result = await prodClient.logout("session-abc");
            expect(result).toBe("https://earsivportal.efatura.gov.tr/login.jsp");
        });

        it("calls the assos-login endpoint", async () => {
            mockFetchOnce({ data: "url" });
            await prodClient.logout("tok");
            expect(getFetchCall().url).toBe(`${ENV.PROD.BASE_URL}/earsiv-services/assos-login`);
        });

        it("PROD: sends assoscmd=anologin (same as login)", async () => {
            mockFetchOnce({ data: "url" });
            await prodClient.logout("tok");
            expect(getFetchCall().assoscmd).toBe("anologin");
        });

        it("TEST: sends assoscmd=logout", async () => {
            mockFetchOnce({ data: "url" });
            await testClient.logout("tok");
            expect(getFetchCall().assoscmd).toBe("logout");
        });

        it("sends the token in the body", async () => {
            mockFetchOnce({ data: "url" });
            await prodClient.logout("my-token-xyz");
            expect(getFetchCall().rawBody).toContain("token=my-token-xyz");
        });

        it("sends rtype=json", async () => {
            mockFetchOnce({ data: "url" });
            await prodClient.logout("tok");
            expect(getFetchCall().rawBody).toContain("rtype=json");
        });
    });
});
