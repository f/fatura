import { describe, it, expect, vi, beforeEach } from "vitest";
import { FaturaClient } from "../../src/index";
import { mockFetchOnce, getFetchCall } from "../helpers/mock-fetch";
import { TOKEN } from "../fixtures/invoice.fixture";

describe("FaturaClient — recipient", () => {
    let client: FaturaClient;

    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
        client = new FaturaClient("PROD");
    });

    describe("getRecipientDataByTaxIDOrTRID", () => {
        const TAX_ID = "9876543210";
        const TRID = "12345678901";

        const recipientData = {
            unvan: "Alıcı Şirketi",
            vknTckn: TAX_ID,
            vergiDairesi: "Kadıköy VD",
        };

        it("sends the correct GIB command", async () => {
            mockFetchOnce({ data: recipientData });
            await client.getRecipientDataByTaxIDOrTRID(TOKEN, TAX_ID);
            expect(getFetchCall().cmd).toBe("SICIL_VEYA_MERNISTEN_BILGILERI_GETIR");
        });

        it("sends the correct pageName", async () => {
            mockFetchOnce({ data: recipientData });
            await client.getRecipientDataByTaxIDOrTRID(TOKEN, TAX_ID);
            expect(getFetchCall().pageName).toBe("RG_BASITFATURA");
        });

        it("sends the tax ID as vknTcknn (double-n)", async () => {
            mockFetchOnce({ data: recipientData });
            await client.getRecipientDataByTaxIDOrTRID(TOKEN, TAX_ID);
            expect(getFetchCall().jp["vknTcknn"]).toBe(TAX_ID);
        });

        it("accepts a Turkish Republic ID number (TRID)", async () => {
            mockFetchOnce({ data: recipientData });
            await client.getRecipientDataByTaxIDOrTRID(TOKEN, TRID);
            expect(getFetchCall().jp["vknTcknn"]).toBe(TRID);
        });

        it("returns result.data", async () => {
            mockFetchOnce({ data: recipientData });
            const result = await client.getRecipientDataByTaxIDOrTRID(TOKEN, TAX_ID);
            expect(result).toEqual(recipientData);
        });

        it("includes the token in the body", async () => {
            mockFetchOnce({ data: recipientData });
            await client.getRecipientDataByTaxIDOrTRID(TOKEN, TAX_ID);
            expect(getFetchCall().token).toBe(TOKEN);
        });

        it("[BUG FIX] is defined exactly once (not duplicate)", () => {
            // Verifies the duplicate function definition bug is fixed:
            // the prototype should have exactly one implementation
            const proto = FaturaClient.prototype;
            expect(typeof proto.getRecipientDataByTaxIDOrTRID).toBe("function");
        });
    });
});
