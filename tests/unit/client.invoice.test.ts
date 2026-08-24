import { describe, it, expect, vi, beforeEach } from "vitest";
import { FaturaClient } from "../../src/index";
import { mockFetchOnce, mockDraftCreation, getFetchCall, CREATE_CALL, GIB_DRAFT_CREATED } from "../helpers/mock-fetch";
import { TOKEN, minimalInvoice, fullInvoice, invoiceListItem } from "../fixtures/invoice.fixture";

describe("FaturaClient — invoice operations", () => {
    let client: FaturaClient;

    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
        client = new FaturaClient("PROD");
    });

    // ─── createDraftInvoice ───────────────────────────────────────────────────

    describe("createDraftInvoice", () => {
        it("sends the correct GIB command", async () => {
            mockDraftCreation();
            await client.createDraftInvoice(TOKEN, minimalInvoice);
            expect(getFetchCall(CREATE_CALL).cmd).toBe("EARSIV_PORTAL_FATURA_OLUSTUR");
        });

        it("sends the correct pageName", async () => {
            mockDraftCreation();
            await client.createDraftInvoice(TOKEN, minimalInvoice);
            expect(getFetchCall(CREATE_CALL).pageName).toBe("RG_BASITFATURA");
        });

        it("includes the token in the body", async () => {
            mockDraftCreation();
            await client.createDraftInvoice(TOKEN, minimalInvoice);
            expect(getFetchCall(CREATE_CALL).token).toBe(TOKEN);
        });

        it("[BUG FIX] sends faturaUuid empty — GİB assigns the ETTN itself", async () => {
            mockDraftCreation();
            await client.createDraftInvoice(TOKEN, minimalInvoice);
            expect(getFetchCall(CREATE_CALL).jp["faturaUuid"]).toBe("");
        });

        it("[BUG FIX] ignores invoiceDetails.uuid instead of sending it to GİB", async () => {
            mockDraftCreation();
            await client.createDraftInvoice(TOKEN, fullInvoice);
            expect(getFetchCall(CREATE_CALL).rawBody).not.toContain(fullInvoice.uuid);
        });

        it("[BUG FIX] returns the ETTN assigned by GİB", async () => {
            mockDraftCreation({ ettn: "0f5926b2-862b-4a31-a4a1-235118b7fc11", belgeNumarasi: "GIB2026000001644" });
            const result = await client.createDraftInvoice(TOKEN, minimalInvoice);
            expect(result.uuid).toBe("0f5926b2-862b-4a31-a4a1-235118b7fc11");
            expect(result.documentNumber).toBe("GIB2026000001644");
        });

        it("[BUG FIX] finds the new ETTN by diffing the draft list, not by taking the first row", async () => {
            mockDraftCreation({ ettn: "yeni-ettn" }, [{ ettn: "onceden-var-olan" }]);
            const result = await client.createDraftInvoice(TOKEN, minimalInvoice);
            expect(result.uuid).toBe("yeni-ettn");
        });

        it("[BUG FIX] throws when GİB rejects the draft (error is only in the data text)", async () => {
            mockFetchOnce({ data: [] });
            mockFetchOnce({ data: "Ettn ya eksik ya boş ya da 36 uzunluk sınırına uymuyor." });
            await expect(client.createDraftInvoice(TOKEN, minimalInvoice)).rejects.toThrow(/Ettn ya eksik/);
        });

        it("sets result.date to the invoice date", async () => {
            mockDraftCreation();
            const result = await client.createDraftInvoice(TOKEN, minimalInvoice);
            expect(result.date).toBe(minimalInvoice.date);
        });

        it("spreads the API response into the result", async () => {
            mockFetchOnce({ data: [] });
            mockFetchOnce({ data: GIB_DRAFT_CREATED, someField: "someValue" });
            mockFetchOnce({ data: [{ ettn: "gib-atanan-ettn" }] });
            const result = await client.createDraftInvoice(TOKEN, minimalInvoice);
            expect(result).toMatchObject({ data: GIB_DRAFT_CREATED, someField: "someValue" });
        });

        it("maps date to faturaTarihi", async () => {
            mockDraftCreation();
            await client.createDraftInvoice(TOKEN, minimalInvoice);
            expect(getFetchCall(CREATE_CALL).jp["faturaTarihi"]).toBe(minimalInvoice.date);
        });

        it("maps time to saat", async () => {
            mockDraftCreation();
            await client.createDraftInvoice(TOKEN, minimalInvoice);
            expect(getFetchCall(CREATE_CALL).jp["saat"]).toBe(minimalInvoice.time);
        });

        it("maps taxIDOrTRID to vknTckn", async () => {
            mockDraftCreation();
            await client.createDraftInvoice(TOKEN, fullInvoice);
            expect(getFetchCall(CREATE_CALL).jp["vknTckn"]).toBe(fullInvoice.taxIDOrTRID);
        });

        it("defaults vknTckn to 11111111111 when taxIDOrTRID is omitted", async () => {
            mockDraftCreation();
            await client.createDraftInvoice(TOKEN, minimalInvoice);
            expect(getFetchCall(CREATE_CALL).jp["vknTckn"]).toBe("11111111111");
        });

        it("maps title to aliciUnvan", async () => {
            mockDraftCreation();
            await client.createDraftInvoice(TOKEN, fullInvoice);
            expect(getFetchCall(CREATE_CALL).jp["aliciUnvan"]).toBe(fullInvoice.title);
        });

        it("maps name to aliciAdi", async () => {
            mockDraftCreation();
            await client.createDraftInvoice(TOKEN, fullInvoice);
            expect(getFetchCall(CREATE_CALL).jp["aliciAdi"]).toBe(fullInvoice.name);
        });

        it("maps surname to aliciSoyadi", async () => {
            mockDraftCreation();
            await client.createDraftInvoice(TOKEN, fullInvoice);
            expect(getFetchCall(CREATE_CALL).jp["aliciSoyadi"]).toBe(fullInvoice.surname);
        });

        it("maps fullAddress to bulvarcaddesokak", async () => {
            mockDraftCreation();
            await client.createDraftInvoice(TOKEN, fullInvoice);
            expect(getFetchCall(CREATE_CALL).jp["bulvarcaddesokak"]).toBe(fullInvoice.fullAddress);
        });

        it("maps city to sehir", async () => {
            mockDraftCreation();
            await client.createDraftInvoice(TOKEN, fullInvoice);
            expect(getFetchCall(CREATE_CALL).jp["sehir"]).toBe(fullInvoice.city);
        });

        it("maps country to ulke", async () => {
            mockDraftCreation();
            await client.createDraftInvoice(TOKEN, fullInvoice);
            expect(getFetchCall(CREATE_CALL).jp["ulke"]).toBe(fullInvoice.country);
        });

        it("maps taxOffice to vergiDairesi", async () => {
            mockDraftCreation();
            await client.createDraftInvoice(TOKEN, fullInvoice);
            expect(getFetchCall(CREATE_CALL).jp["vergiDairesi"]).toBe(fullInvoice.taxOffice);
        });

        // ── BUG FIX: dispatchDate → irsaliyeTarihi (was discountDate) ──────────

        it("[BUG FIX] maps dispatchDate → irsaliyeTarihi", async () => {
            mockDraftCreation();
            await client.createDraftInvoice(TOKEN, fullInvoice);
            expect(getFetchCall(CREATE_CALL).jp["irsaliyeTarihi"]).toBe(fullInvoice.dispatchDate);
        });

        it("[BUG FIX] irsaliyeTarihi is not taken from a 'discountDate' field", async () => {
            const invoice = { ...minimalInvoice, dispatchDate: "02/20/2024" };
            mockDraftCreation();
            await client.createDraftInvoice(TOKEN, invoice);
            expect(getFetchCall(CREATE_CALL).jp["irsaliyeTarihi"]).toBe("02/20/2024");
        });

        // ── BUG FIX: halRusumuTutari from its own field ──────────────────────────

        it("[BUG FIX] maps halRusumuTutari from its own field (not hammaliyeTutari)", async () => {
            const invoice = {
                ...minimalInvoice,
                halRusumuTutari: "99.00",
                hammaliyeTutari: "10.00",
            };
            mockDraftCreation();
            await client.createDraftInvoice(TOKEN, invoice);
            const jp = getFetchCall(CREATE_CALL).jp;
            expect(jp["halRusumuTutari"]).toBe("99.00");
            expect(jp["hammaliyeTutari"]).toBe("10.00");
        });

        // ── Items mapping ─────────────────────────────────────────────────────────

        it("maps items to malHizmetTable", async () => {
            mockDraftCreation();
            await client.createDraftInvoice(TOKEN, minimalInvoice);
            const table = getFetchCall(CREATE_CALL).jp["malHizmetTable"] as unknown[];
            expect(Array.isArray(table)).toBe(true);
            expect(table).toHaveLength(1);
        });

        it("maps item.name to malHizmet", async () => {
            mockDraftCreation();
            await client.createDraftInvoice(TOKEN, minimalInvoice);
            const row = (getFetchCall(CREATE_CALL).jp["malHizmetTable"] as Array<Record<string, unknown>>)[0];
            expect(row["malHizmet"]).toBe(minimalInvoice.items[0].name);
        });

        it("maps item.VATRate to kdvOrani as string", async () => {
            mockDraftCreation();
            await client.createDraftInvoice(TOKEN, minimalInvoice);
            const row = (getFetchCall(CREATE_CALL).jp["malHizmetTable"] as Array<Record<string, unknown>>)[0];
            expect(row["kdvOrani"]).toBe("20");
        });

        it("uses 'C62' as default unit type when unitType is omitted", async () => {
            mockDraftCreation();
            await client.createDraftInvoice(TOKEN, minimalInvoice);
            const row = (getFetchCall(CREATE_CALL).jp["malHizmetTable"] as Array<Record<string, unknown>>)[0];
            expect(row["birim"]).toBe("C62");
        });

        it("uses item.unitType when provided", async () => {
            mockDraftCreation();
            await client.createDraftInvoice(TOKEN, fullInvoice);
            const row = (getFetchCall(CREATE_CALL).jp["malHizmetTable"] as Array<Record<string, unknown>>)[0];
            expect(row["birim"]).toBe("HUR");
        });

        it("formats item.price as 2-decimal string", async () => {
            mockDraftCreation();
            await client.createDraftInvoice(TOKEN, minimalInvoice);
            const row = (getFetchCall(CREATE_CALL).jp["malHizmetTable"] as Array<Record<string, unknown>>)[0];
            expect(row["fiyat"]).toBe("100.00");
        });

        // ── Financial totals ──────────────────────────────────────────────────────

        it("formats grandTotal as 2-decimal string in matrah", async () => {
            mockDraftCreation();
            await client.createDraftInvoice(TOKEN, minimalInvoice);
            expect(getFetchCall(CREATE_CALL).jp["matrah"]).toBe("100.00");
        });

        it("formats totalVAT as 2-decimal string in hesaplanankdv", async () => {
            mockDraftCreation();
            await client.createDraftInvoice(TOKEN, minimalInvoice);
            expect(getFetchCall(CREATE_CALL).jp["hesaplanankdv"]).toBe("20.00");
        });

        it("formats grandTotalInclVAT in vergilerDahilToplamTutar", async () => {
            mockDraftCreation();
            await client.createDraftInvoice(TOKEN, minimalInvoice);
            expect(getFetchCall(CREATE_CALL).jp["vergilerDahilToplamTutar"]).toBe("120.00");
        });

        it("formats paymentTotal in odenecekTutar", async () => {
            mockDraftCreation();
            await client.createDraftInvoice(TOKEN, minimalInvoice);
            expect(getFetchCall(CREATE_CALL).jp["odenecekTutar"]).toBe("120.00");
        });

        it("puts Turkish price text in 'not' field", async () => {
            mockDraftCreation();
            await client.createDraftInvoice(TOKEN, minimalInvoice);
            const not = getFetchCall(CREATE_CALL).jp["not"] as string;
            expect(not).toContain("LIRA");
            expect(not).toContain("KURUS");
        });

        it("defaults item numeric fields to 0 when omitted (quantity, unitPrice, VATRate, VATAmount, VATAmountOfTax)", async () => {
            const invoice = {
                ...minimalInvoice,
                items: [{ name: "Minimal Item", price: 50 }],
            };
            mockDraftCreation();
            await client.createDraftInvoice(TOKEN, invoice);
            const row = (getFetchCall(CREATE_CALL).jp["malHizmetTable"] as Array<Record<string, unknown>>)[0];
            expect(row["malHizmetTutari"]).toBe("0.00"); // 0 * 0
            expect(row["kdvOrani"]).toBe("0");
            expect(row["kdvTutari"]).toBe("0.00");
            expect(row["vergininKdvTutari"]).toBe("0.00");
        });

        it("maps returnItems to iadeTable as empty objects", async () => {
            const invoice = { ...minimalInvoice, returnItems: ["item1", "item2"] };
            mockDraftCreation();
            await client.createDraftInvoice(TOKEN, invoice);
            const iadeTable = getFetchCall(CREATE_CALL).jp["iadeTable"] as unknown[];
            expect(Array.isArray(iadeTable)).toBe(true);
            expect(iadeTable).toHaveLength(2);
            expect(iadeTable[0]).toEqual({});
        });

        it("defaults currency to TRY", async () => {
            mockDraftCreation();
            await client.createDraftInvoice(TOKEN, minimalInvoice);
            expect(getFetchCall(CREATE_CALL).jp["paraBirimi"]).toBe("TRY");
        });

        it("uses specified currency", async () => {
            mockDraftCreation();
            await client.createDraftInvoice(TOKEN, fullInvoice);
            expect(getFetchCall(CREATE_CALL).jp["paraBirimi"]).toBe("EUR");
        });
    });

    // ─── findInvoice ──────────────────────────────────────────────────────────

    describe("findInvoice", () => {
        const draft = { date: "01/15/2024", uuid: "11111111-2222-1333-a444-555555555555" };

        it("queries getAllInvoicesByDateRange with the same start and end date", async () => {
            mockFetchOnce({ data: [invoiceListItem] });
            await client.findInvoice(TOKEN, draft);
            const jp = getFetchCall().jp;
            expect(jp["baslangic"]).toBe(draft.date);
            expect(jp["bitis"]).toBe(draft.date);
        });

        it("returns the invoice whose ettn matches the uuid", async () => {
            mockFetchOnce({ data: [invoiceListItem] });
            const result = await client.findInvoice(TOKEN, draft);
            expect(result).toEqual(invoiceListItem);
        });

        it("returns undefined when no invoice matches the uuid", async () => {
            const otherItem = { ...invoiceListItem, ettn: "different-uuid" };
            mockFetchOnce({ data: [otherItem] });
            const result = await client.findInvoice(TOKEN, draft);
            expect(result).toBeUndefined();
        });

        it("returns undefined when the list is empty", async () => {
            mockFetchOnce({ data: [] });
            const result = await client.findInvoice(TOKEN, draft);
            expect(result).toBeUndefined();
        });

        it("handles multiple invoices and picks the correct one", async () => {
            const other = { ...invoiceListItem, ettn: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee" };
            mockFetchOnce({ data: [other, invoiceListItem] });
            const result = await client.findInvoice(TOKEN, draft);
            expect(result?.ettn).toBe(draft.uuid);
        });
    });

    // ─── signDraftInvoice ────────────────────────────────────────────────────

    describe("signDraftInvoice", () => {
        it("sends the correct GIB command", async () => {
            mockFetchOnce({ data: "ok" });
            await client.signDraftInvoice(TOKEN, invoiceListItem);
            expect(getFetchCall().cmd).toBe("EARSIV_PORTAL_FATURA_HSM_CIHAZI_ILE_IMZALA");
        });

        it("sends the correct pageName", async () => {
            mockFetchOnce({ data: "ok" });
            await client.signDraftInvoice(TOKEN, invoiceListItem);
            expect(getFetchCall().pageName).toBe("RG_BASITTASLAKLAR");
        });

        it("wraps the invoice in imzalanacaklar array", async () => {
            mockFetchOnce({ data: "ok" });
            await client.signDraftInvoice(TOKEN, invoiceListItem);
            const imzalanacaklar = getFetchCall().jp["imzalanacaklar"] as unknown[];
            expect(Array.isArray(imzalanacaklar)).toBe(true);
            expect(imzalanacaklar).toHaveLength(1);
            expect(imzalanacaklar[0]).toMatchObject({ ettn: invoiceListItem.ettn });
        });
    });

    // ─── cancelDraftInvoice ──────────────────────────────────────────────────

    describe("cancelDraftInvoice", () => {
        const reason = "Yanlış kesildi";

        it("sends the correct GIB command", async () => {
            mockFetchOnce({ data: "cancelled" });
            await client.cancelDraftInvoice(TOKEN, reason, invoiceListItem);
            expect(getFetchCall().cmd).toBe("EARSIV_PORTAL_FATURA_SIL");
        });

        it("sends the correct pageName", async () => {
            mockFetchOnce({ data: "cancelled" });
            await client.cancelDraftInvoice(TOKEN, reason, invoiceListItem);
            expect(getFetchCall().pageName).toBe("RG_BASITTASLAKLAR");
        });

        it("sends the cancellation reason in aciklama", async () => {
            mockFetchOnce({ data: "cancelled" });
            await client.cancelDraftInvoice(TOKEN, reason, invoiceListItem);
            expect(getFetchCall().jp["aciklama"]).toBe(reason);
        });

        it("wraps the invoice in silinecekler array", async () => {
            mockFetchOnce({ data: "cancelled" });
            await client.cancelDraftInvoice(TOKEN, reason, invoiceListItem);
            const silinecekler = getFetchCall().jp["silinecekler"] as unknown[];
            expect(Array.isArray(silinecekler)).toBe(true);
            expect(silinecekler).toHaveLength(1);
        });

        it("returns result.data", async () => {
            mockFetchOnce({ data: "cancel-confirmation" });
            const result = await client.cancelDraftInvoice(TOKEN, reason, invoiceListItem);
            expect(result).toBe("cancel-confirmation");
        });
    });
});
