import { describe, it, expect, vi, beforeEach } from "vitest";
import { FaturaClient, createFaturaClient } from "../../src/index";
import { ENV } from "../../src/constants/environment";

describe("FaturaClient — environment & constructor", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    it("defaults to PROD when no argument given", () => {
        const client = new FaturaClient();
        // @ts-expect-error private FaturaClient field for tests
        expect(client.baseURL).toBe(ENV.PROD.BASE_URL);
    });

    it('accepts "PROD" explicitly', () => {
        const client = new FaturaClient("PROD");
        // @ts-expect-error private FaturaClient field for tests
        expect(client.baseURL).toBe(ENV.PROD.BASE_URL);
    });

    it('accepts "TEST" and uses test base URL', () => {
        const client = new FaturaClient("TEST");
        // @ts-expect-error private FaturaClient field for tests
        expect(client.baseURL).toBe(ENV.TEST.BASE_URL);
    });

    it("PROD and TEST base URLs are different", () => {
        expect(ENV.PROD.BASE_URL).not.toBe(ENV.TEST.BASE_URL);
    });

    it("sets PROD loginCmd to 'anologin'", () => {
        const client = new FaturaClient("PROD");
        // @ts-expect-error private FaturaClient field for tests
        expect(client.loginCmd).toBe("anologin");
    });

    it("sets TEST loginCmd to 'login'", () => {
        const client = new FaturaClient("TEST");
        // @ts-expect-error private FaturaClient field for tests
        expect(client.loginCmd).toBe("login");
    });

    it("sets PROD logoutCmd to 'anologin'", () => {
        const client = new FaturaClient("PROD");
        // @ts-expect-error private FaturaClient field for tests
        expect(client.logoutCmd).toBe("anologin");
    });

    it("sets TEST logoutCmd to 'logout'", () => {
        const client = new FaturaClient("TEST");
        // @ts-expect-error private FaturaClient field for tests
        expect(client.logoutCmd).toBe("logout");
    });

    describe("createFaturaClient factory", () => {
        it("returns a FaturaClient instance", () => {
            expect(createFaturaClient()).toBeInstanceOf(FaturaClient);
        });

        it("defaults to PROD", () => {
            const client = createFaturaClient();
            // @ts-expect-error private FaturaClient field for tests
            expect(client.baseURL).toBe(ENV.PROD.BASE_URL);
        });

        it("passes env argument through", () => {
            const client = createFaturaClient("TEST");
            // @ts-expect-error private FaturaClient field for tests
            expect(client.baseURL).toBe(ENV.TEST.BASE_URL);
        });

        it("two clients with different envs are independent", () => {
            const prod = createFaturaClient("PROD");
            const test = createFaturaClient("TEST");
            // @ts-expect-error private FaturaClient field for tests
            expect(prod.baseURL).not.toBe(test.baseURL);
            // @ts-expect-error private FaturaClient field for tests
            expect(prod.loginCmd).not.toBe(test.loginCmd);
        });
    });
});
