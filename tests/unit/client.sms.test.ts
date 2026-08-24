import { describe, it, expect, vi, beforeEach } from "vitest";
import { FaturaClient } from "../../src/index";
import { mockFetchOnce, getFetchCall } from "../helpers/mock-fetch";
import { TOKEN } from "../fixtures/invoice.fixture";

describe("FaturaClient — SMS verification", () => {
    let client: FaturaClient;

    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
        client = new FaturaClient("PROD");
    });

    // ─── sendSignSMSCode ──────────────────────────────────────────────────────

    describe("sendSignSMSCode", () => {
        const PHONE = "05321234567";

        it("sends the correct GIB command", async () => {
            mockFetchOnce({ oid: "op-id-123" });
            await client.sendSignSMSCode(TOKEN, PHONE);
            expect(getFetchCall().cmd).toBe("EARSIV_PORTAL_SMSSIFRE_GONDER");
        });

        it("sends the correct pageName", async () => {
            mockFetchOnce({ oid: "op-id-123" });
            await client.sendSignSMSCode(TOKEN, PHONE);
            expect(getFetchCall().pageName).toBe("RG_SMSONAY");
        });

        it("sends the phone number as CEPTEL", async () => {
            mockFetchOnce({ oid: "op-id-123" });
            await client.sendSignSMSCode(TOKEN, PHONE);
            expect(getFetchCall().jp["CEPTEL"]).toBe(PHONE);
        });

        it("sends KCEPTEL as false", async () => {
            mockFetchOnce({ oid: "op-id-123" });
            await client.sendSignSMSCode(TOKEN, PHONE);
            expect(getFetchCall().jp["KCEPTEL"]).toBe(false);
        });

        it("sends TIP as empty string", async () => {
            mockFetchOnce({ oid: "op-id-123" });
            await client.sendSignSMSCode(TOKEN, PHONE);
            expect(getFetchCall().jp["TIP"]).toBe("");
        });

        it("returns the operation ID (oid) from the response", async () => {
            mockFetchOnce({ oid: "operation-id-xyz" });
            const result = await client.sendSignSMSCode(TOKEN, PHONE);
            expect(result).toBe("operation-id-xyz");
        });

        it("returns undefined when oid is not in the response", async () => {
            mockFetchOnce({});
            const result = await client.sendSignSMSCode(TOKEN, PHONE);
            expect(result).toBeUndefined();
        });

        it("includes the token in the body", async () => {
            mockFetchOnce({ oid: "x" });
            await client.sendSignSMSCode(TOKEN, PHONE);
            expect(getFetchCall().token).toBe(TOKEN);
        });

        it("[BUG FIX] reads oid from response.data.oid", async () => {
            mockFetchOnce({ data: { oid: "data-icindeki-oid" } });
            const result = await client.sendSignSMSCode(TOKEN, PHONE);
            expect(result).toBe("data-icindeki-oid");
        });
    });

    // ─── verifySignSMSCode ────────────────────────────────────────────────────

    describe("verifySignSMSCode", () => {
        const SMS_CODE = "123456";
        const OPERATION_ID = "operation-id-xyz";

        it("sends the correct GIB command", async () => {
            mockFetchOnce({ oid: OPERATION_ID });
            await client.verifySignSMSCode(TOKEN, SMS_CODE, OPERATION_ID);
            expect(getFetchCall().cmd).toBe("EARSIV_PORTAL_SMSSIFRE_DOGRULA");
        });

        it("sends the correct pageName", async () => {
            mockFetchOnce({ oid: OPERATION_ID });
            await client.verifySignSMSCode(TOKEN, SMS_CODE, OPERATION_ID);
            expect(getFetchCall().pageName).toBe("RG_SMSONAY");
        });

        it("sends the SMS code as SIFRE", async () => {
            mockFetchOnce({ oid: OPERATION_ID });
            await client.verifySignSMSCode(TOKEN, SMS_CODE, OPERATION_ID);
            expect(getFetchCall().jp["SIFRE"]).toBe(SMS_CODE);
        });

        it("sends the operation ID as OID", async () => {
            mockFetchOnce({ oid: OPERATION_ID });
            await client.verifySignSMSCode(TOKEN, SMS_CODE, OPERATION_ID);
            expect(getFetchCall().jp["OID"]).toBe(OPERATION_ID);
        });

        it("returns the oid from the response", async () => {
            mockFetchOnce({ oid: "confirmed-op-id" });
            const result = await client.verifySignSMSCode(TOKEN, SMS_CODE, OPERATION_ID);
            expect(result).toBe("confirmed-op-id");
        });

        it("returns undefined when oid is absent", async () => {
            mockFetchOnce({});
            const result = await client.verifySignSMSCode(TOKEN, SMS_CODE, OPERATION_ID);
            expect(result).toBeUndefined();
        });

        it("[BUG FIX] uses EARSIV_PORTAL_SMSSIFRE_DOGRULA (not a non-existent key)", async () => {
            // In the original JS, COMMANDS.verifySignSMSCode was used — that key did not
            // exist in COMMANDS. The correct key is verifySMSCode → EARSIV_PORTAL_SMSSIFRE_DOGRULA.
            mockFetchOnce({ oid: "x" });
            await client.verifySignSMSCode(TOKEN, SMS_CODE, OPERATION_ID);
            expect(getFetchCall().cmd).toBe("EARSIV_PORTAL_SMSSIFRE_DOGRULA");
        });

        it("[BUG FIX] sends OPR=1 — without it GİB verifies the code but signs nothing", async () => {
            mockFetchOnce({ oid: "x" });
            await client.verifySignSMSCode(TOKEN, SMS_CODE, OPERATION_ID);
            expect(getFetchCall().jp["OPR"]).toBe(1);
        });

        it("[BUG FIX] sends the invoices to be signed as DATA", async () => {
            const invoices = [{ ettn: "ettn-1" }, { ettn: "ettn-2" }];
            mockFetchOnce({ oid: "x" });
            await client.verifySignSMSCode(TOKEN, SMS_CODE, OPERATION_ID, invoices);
            expect(getFetchCall().jp["DATA"]).toEqual(invoices);
        });

        it("sends DATA as an empty array when no invoice is given", async () => {
            mockFetchOnce({ oid: "x" });
            await client.verifySignSMSCode(TOKEN, SMS_CODE, OPERATION_ID);
            expect(getFetchCall().jp["DATA"]).toEqual([]);
        });

        it("[BUG FIX] reads oid from response.data.oid", async () => {
            mockFetchOnce({ data: { oid: "data-icindeki-oid" } });
            const result = await client.verifySignSMSCode(TOKEN, SMS_CODE, OPERATION_ID);
            expect(result).toBe("data-icindeki-oid");
        });

        it("uses a different command than sendSignSMSCode", async () => {
            mockFetchOnce({ oid: "x" });
            await client.verifySignSMSCode(TOKEN, SMS_CODE, OPERATION_ID);
            expect(getFetchCall().cmd).not.toBe("EARSIV_PORTAL_SMSSIFRE_GONDER");
        });
    });
});
