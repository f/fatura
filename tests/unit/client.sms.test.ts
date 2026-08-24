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

    // ─── getSignPhoneNumber ───────────────────────────────────────────────────

    describe("getSignPhoneNumber", () => {
        it("sends the correct GIB command", async () => {
            mockFetchOnce({ data: { telefon: "5301234567" } });
            await client.getSignPhoneNumber(TOKEN);
            expect(getFetchCall().cmd).toBe("EARSIV_PORTAL_TELEFONNO_SORGULA");
        });

        it("sends the correct pageName", async () => {
            mockFetchOnce({ data: { telefon: "5301234567" } });
            await client.getSignPhoneNumber(TOKEN);
            expect(getFetchCall().pageName).toBe("RG_SMSONAY");
        });

        it("sends an empty payload", async () => {
            mockFetchOnce({ data: { telefon: "5301234567" } });
            await client.getSignPhoneNumber(TOKEN);
            expect(getFetchCall().jp).toEqual({});
        });

        it("returns the registered phone number", async () => {
            mockFetchOnce({ data: { telefon: "5301234567" } });
            expect(await client.getSignPhoneNumber(TOKEN)).toBe("5301234567");
        });

        it("returns undefined when no phone is registered", async () => {
            mockFetchOnce({ data: {} });
            expect(await client.getSignPhoneNumber(TOKEN)).toBeUndefined();
        });
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

        it("[BUG FIX] uses the opaque signing command id, not EARSIV_PORTAL_SMSSIFRE_DOGRULA", async () => {
            // Canlı portal EARSIV_PORTAL_SMSSIFRE_DOGRULA için "Service Not Found" döner.
            mockFetchOnce({ data: { sonuc: "1" } });
            await client.verifySignSMSCode(TOKEN, SMS_CODE, OPERATION_ID);
            expect(getFetchCall().cmd).toBe("0lhozfib5410mp");
        });

        it("sends the correct pageName", async () => {
            mockFetchOnce({ data: { sonuc: "1" } });
            await client.verifySignSMSCode(TOKEN, SMS_CODE, OPERATION_ID);
            expect(getFetchCall().pageName).toBe("RG_SMSONAY");
        });

        it("sends the SMS code as SIFRE", async () => {
            mockFetchOnce({ data: { sonuc: "1" } });
            await client.verifySignSMSCode(TOKEN, SMS_CODE, OPERATION_ID);
            expect(getFetchCall().jp["SIFRE"]).toBe(SMS_CODE);
        });

        it("sends the operation ID as OID", async () => {
            mockFetchOnce({ data: { sonuc: "1" } });
            await client.verifySignSMSCode(TOKEN, SMS_CODE, OPERATION_ID);
            expect(getFetchCall().jp["OID"]).toBe(OPERATION_ID);
        });

        it("[BUG FIX] returns true when GİB reports sonuc=1", async () => {
            mockFetchOnce({ data: { sonuc: "1" } });
            expect(await client.verifySignSMSCode(TOKEN, SMS_CODE, OPERATION_ID)).toBe(true);
        });

        it("[BUG FIX] returns false when GİB does not report sonuc=1", async () => {
            mockFetchOnce({ data: { sonuc: "0" } });
            expect(await client.verifySignSMSCode(TOKEN, SMS_CODE, OPERATION_ID)).toBe(false);
        });

        it("returns false when the response has no sonuc field", async () => {
            mockFetchOnce({});
            expect(await client.verifySignSMSCode(TOKEN, SMS_CODE, OPERATION_ID)).toBe(false);
        });

        it("[BUG FIX] sends OPR=1 — without it GİB verifies the code but signs nothing", async () => {
            mockFetchOnce({ data: { sonuc: "1" } });
            await client.verifySignSMSCode(TOKEN, SMS_CODE, OPERATION_ID);
            expect(getFetchCall().jp["OPR"]).toBe(1);
        });

        it("[BUG FIX] sends the invoices to be signed as DATA", async () => {
            const invoices = [{ ettn: "ettn-1" }, { ettn: "ettn-2" }];
            mockFetchOnce({ data: { sonuc: "1" } });
            await client.verifySignSMSCode(TOKEN, SMS_CODE, OPERATION_ID, invoices);
            expect(getFetchCall().jp["DATA"]).toEqual(invoices);
        });

        it("sends DATA as an empty array when no invoice is given", async () => {
            mockFetchOnce({ data: { sonuc: "1" } });
            await client.verifySignSMSCode(TOKEN, SMS_CODE, OPERATION_ID);
            expect(getFetchCall().jp["DATA"]).toEqual([]);
        });

        it("uses a different command than sendSignSMSCode", async () => {
            mockFetchOnce({ data: { sonuc: "1" } });
            await client.verifySignSMSCode(TOKEN, SMS_CODE, OPERATION_ID);
            expect(getFetchCall().cmd).not.toBe("EARSIV_PORTAL_SMSSIFRE_GONDER");
        });
    });
});
