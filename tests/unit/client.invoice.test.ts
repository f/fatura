import { describe, it, expect, vi, beforeEach } from "vitest";
import { FaturaClient } from "../../src/index";
import {
  mockFetchOnce,
  mockFetchSequence,
  getFetchCall,
} from "../helpers/mock-fetch";
import {
  TOKEN,
  minimalInvoice,
  fullInvoice,
  invoiceListItem,
} from "../fixtures/invoice.fixture";

describe("FaturaClient — invoice operations", () => {
  let client: FaturaClient;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    client = new FaturaClient("PROD");
  });

  // ─── createDraftInvoice ───────────────────────────────────────────────────

  describe("createDraftInvoice", () => {
    it("sends the correct GIB command", async () => {
      mockFetchOnce({ data: "ok" });
      await client.createDraftInvoice(TOKEN, minimalInvoice);
      expect(getFetchCall().cmd).toBe("EARSIV_PORTAL_FATURA_OLUSTUR");
    });

    it("sends the correct pageName", async () => {
      mockFetchOnce({ data: "ok" });
      await client.createDraftInvoice(TOKEN, minimalInvoice);
      expect(getFetchCall().pageName).toBe("RG_BASITFATURA");
    });

    it("includes the token in the body", async () => {
      mockFetchOnce({ data: "ok" });
      await client.createDraftInvoice(TOKEN, minimalInvoice);
      expect(getFetchCall().token).toBe(TOKEN);
    });

    it("auto-generates a UUID when none is provided", async () => {
      mockFetchOnce({ data: "ok" });
      const result = await client.createDraftInvoice(TOKEN, minimalInvoice);
      expect(result.uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it("uses the UUID provided in invoiceDetails", async () => {
      mockFetchOnce({ data: "ok" });
      const result = await client.createDraftInvoice(TOKEN, fullInvoice);
      expect(result.uuid).toBe(fullInvoice.uuid);
    });

    it("sets result.date to the invoice date", async () => {
      mockFetchOnce({ data: "ok" });
      const result = await client.createDraftInvoice(TOKEN, minimalInvoice);
      expect(result.date).toBe(minimalInvoice.date);
    });

    it("spreads the API response into the result", async () => {
      const apiResponse = { data: "ok", someField: "someValue" };
      mockFetchOnce(apiResponse);
      const result = await client.createDraftInvoice(TOKEN, minimalInvoice);
      expect(result).toMatchObject(apiResponse);
    });

    it("maps date to faturaTarihi", async () => {
      mockFetchOnce({ data: "ok" });
      await client.createDraftInvoice(TOKEN, minimalInvoice);
      expect(getFetchCall().jp["faturaTarihi"]).toBe(minimalInvoice.date);
    });

    it("maps time to saat", async () => {
      mockFetchOnce({ data: "ok" });
      await client.createDraftInvoice(TOKEN, minimalInvoice);
      expect(getFetchCall().jp["saat"]).toBe(minimalInvoice.time);
    });

    it("maps taxIDOrTRID to vknTckn", async () => {
      mockFetchOnce({ data: "ok" });
      await client.createDraftInvoice(TOKEN, fullInvoice);
      expect(getFetchCall().jp["vknTckn"]).toBe(fullInvoice.taxIDOrTRID);
    });

    it("defaults vknTckn to 11111111111 when taxIDOrTRID is omitted", async () => {
      mockFetchOnce({ data: "ok" });
      await client.createDraftInvoice(TOKEN, minimalInvoice);
      expect(getFetchCall().jp["vknTckn"]).toBe("11111111111");
    });

    it("maps title to aliciUnvan", async () => {
      mockFetchOnce({ data: "ok" });
      await client.createDraftInvoice(TOKEN, fullInvoice);
      expect(getFetchCall().jp["aliciUnvan"]).toBe(fullInvoice.title);
    });

    it("maps name to aliciAdi", async () => {
      mockFetchOnce({ data: "ok" });
      await client.createDraftInvoice(TOKEN, fullInvoice);
      expect(getFetchCall().jp["aliciAdi"]).toBe(fullInvoice.name);
    });

    it("maps surname to aliciSoyadi", async () => {
      mockFetchOnce({ data: "ok" });
      await client.createDraftInvoice(TOKEN, fullInvoice);
      expect(getFetchCall().jp["aliciSoyadi"]).toBe(fullInvoice.surname);
    });

    it("maps fullAddress to bulvarcaddesokak", async () => {
      mockFetchOnce({ data: "ok" });
      await client.createDraftInvoice(TOKEN, fullInvoice);
      expect(getFetchCall().jp["bulvarcaddesokak"]).toBe(fullInvoice.fullAddress);
    });

    it("maps city to sehir", async () => {
      mockFetchOnce({ data: "ok" });
      await client.createDraftInvoice(TOKEN, fullInvoice);
      expect(getFetchCall().jp["sehir"]).toBe(fullInvoice.city);
    });

    it("maps country to ulke", async () => {
      mockFetchOnce({ data: "ok" });
      await client.createDraftInvoice(TOKEN, fullInvoice);
      expect(getFetchCall().jp["ulke"]).toBe(fullInvoice.country);
    });

    it("maps taxOffice to vergiDairesi", async () => {
      mockFetchOnce({ data: "ok" });
      await client.createDraftInvoice(TOKEN, fullInvoice);
      expect(getFetchCall().jp["vergiDairesi"]).toBe(fullInvoice.taxOffice);
    });

    // ── BUG FIX: dispatchDate → irsaliyeTarihi (was discountDate) ──────────

    it("[BUG FIX] maps dispatchDate → irsaliyeTarihi", async () => {
      mockFetchOnce({ data: "ok" });
      await client.createDraftInvoice(TOKEN, fullInvoice);
      expect(getFetchCall().jp["irsaliyeTarihi"]).toBe(fullInvoice.dispatchDate);
    });

    it("[BUG FIX] irsaliyeTarihi is not taken from a 'discountDate' field", async () => {
      const invoice = { ...minimalInvoice, dispatchDate: "02/20/2024" };
      mockFetchOnce({ data: "ok" });
      await client.createDraftInvoice(TOKEN, invoice);
      expect(getFetchCall().jp["irsaliyeTarihi"]).toBe("02/20/2024");
    });

    // ── BUG FIX: halRusumuTutari from its own field ──────────────────────────

    it("[BUG FIX] maps halRusumuTutari from its own field (not hammaliyeTutari)", async () => {
      const invoice = {
        ...minimalInvoice,
        halRusumuTutari: "99.00",
        hammaliyeTutari: "10.00",
      };
      mockFetchOnce({ data: "ok" });
      await client.createDraftInvoice(TOKEN, invoice);
      const jp = getFetchCall().jp;
      expect(jp["halRusumuTutari"]).toBe("99.00");
      expect(jp["hammaliyeTutari"]).toBe("10.00");
    });

    // ── Items mapping ─────────────────────────────────────────────────────────

    it("maps items to malHizmetTable", async () => {
      mockFetchOnce({ data: "ok" });
      await client.createDraftInvoice(TOKEN, minimalInvoice);
      const table = getFetchCall().jp["malHizmetTable"] as unknown[];
      expect(Array.isArray(table)).toBe(true);
      expect(table).toHaveLength(1);
    });

    it("maps item.name to malHizmet", async () => {
      mockFetchOnce({ data: "ok" });
      await client.createDraftInvoice(TOKEN, minimalInvoice);
      const row = (getFetchCall().jp["malHizmetTable"] as Array<Record<string, unknown>>)[0];
      expect(row["malHizmet"]).toBe(minimalInvoice.items[0].name);
    });

    it("maps item.VATRate to kdvOrani as string", async () => {
      mockFetchOnce({ data: "ok" });
      await client.createDraftInvoice(TOKEN, minimalInvoice);
      const row = (getFetchCall().jp["malHizmetTable"] as Array<Record<string, unknown>>)[0];
      expect(row["kdvOrani"]).toBe("20");
    });

    it("uses 'C62' as default unit type when unitType is omitted", async () => {
      mockFetchOnce({ data: "ok" });
      await client.createDraftInvoice(TOKEN, minimalInvoice);
      const row = (getFetchCall().jp["malHizmetTable"] as Array<Record<string, unknown>>)[0];
      expect(row["birim"]).toBe("C62");
    });

    it("uses item.unitType when provided", async () => {
      mockFetchOnce({ data: "ok" });
      await client.createDraftInvoice(TOKEN, fullInvoice);
      const row = (getFetchCall().jp["malHizmetTable"] as Array<Record<string, unknown>>)[0];
      expect(row["birim"]).toBe("HUR");
    });

    it("formats item.price as 2-decimal string", async () => {
      mockFetchOnce({ data: "ok" });
      await client.createDraftInvoice(TOKEN, minimalInvoice);
      const row = (getFetchCall().jp["malHizmetTable"] as Array<Record<string, unknown>>)[0];
      expect(row["fiyat"]).toBe("100.00");
    });

    // ── Financial totals ──────────────────────────────────────────────────────

    it("formats grandTotal as 2-decimal string in matrah", async () => {
      mockFetchOnce({ data: "ok" });
      await client.createDraftInvoice(TOKEN, minimalInvoice);
      expect(getFetchCall().jp["matrah"]).toBe("100.00");
    });

    it("formats totalVAT as 2-decimal string in hesaplanankdv", async () => {
      mockFetchOnce({ data: "ok" });
      await client.createDraftInvoice(TOKEN, minimalInvoice);
      expect(getFetchCall().jp["hesaplanankdv"]).toBe("20.00");
    });

    it("formats grandTotalInclVAT in vergilerDahilToplamTutar", async () => {
      mockFetchOnce({ data: "ok" });
      await client.createDraftInvoice(TOKEN, minimalInvoice);
      expect(getFetchCall().jp["vergilerDahilToplamTutar"]).toBe("120.00");
    });

    it("formats paymentTotal in odenecekTutar", async () => {
      mockFetchOnce({ data: "ok" });
      await client.createDraftInvoice(TOKEN, minimalInvoice);
      expect(getFetchCall().jp["odenecekTutar"]).toBe("120.00");
    });

    it("puts Turkish price text in 'not' field", async () => {
      mockFetchOnce({ data: "ok" });
      await client.createDraftInvoice(TOKEN, minimalInvoice);
      const not = getFetchCall().jp["not"] as string;
      expect(not).toContain("LIRA");
      expect(not).toContain("KURUS");
    });

    it("defaults item numeric fields to 0 when omitted (quantity, unitPrice, VATRate, VATAmount, VATAmountOfTax)", async () => {
      const invoice = {
        ...minimalInvoice,
        items: [{ name: "Minimal Item", price: 50 }],
      };
      mockFetchOnce({ data: "ok" });
      await client.createDraftInvoice(TOKEN, invoice);
      const row = (getFetchCall().jp["malHizmetTable"] as Array<Record<string, unknown>>)[0];
      expect(row["malHizmetTutari"]).toBe("0.00");  // 0 * 0
      expect(row["kdvOrani"]).toBe("0");
      expect(row["kdvTutari"]).toBe("0.00");
      expect(row["vergininKdvTutari"]).toBe("0.00");
    });

    it("maps returnItems to iadeTable as empty objects", async () => {
      const invoice = { ...minimalInvoice, returnItems: ["item1", "item2"] };
      mockFetchOnce({ data: "ok" });
      await client.createDraftInvoice(TOKEN, invoice);
      const iadeTable = getFetchCall().jp["iadeTable"] as unknown[];
      expect(Array.isArray(iadeTable)).toBe(true);
      expect(iadeTable).toHaveLength(2);
      expect(iadeTable[0]).toEqual({});
    });

    it("defaults currency to TRY", async () => {
      mockFetchOnce({ data: "ok" });
      await client.createDraftInvoice(TOKEN, minimalInvoice);
      expect(getFetchCall().jp["paraBirimi"]).toBe("TRY");
    });

    it("uses specified currency", async () => {
      mockFetchOnce({ data: "ok" });
      await client.createDraftInvoice(TOKEN, fullInvoice);
      expect(getFetchCall().jp["paraBirimi"]).toBe("EUR");
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
