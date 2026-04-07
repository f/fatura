import { describe, it, expect, vi, beforeEach } from "vitest";
import { FaturaClient } from "../../src/index";
import { mockFetchOnce, getFetchCall } from "../helpers/mock-fetch";
import { TOKEN, invoiceListItem } from "../fixtures/invoice.fixture";

describe("FaturaClient — query operations", () => {
  let client: FaturaClient;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    client = new FaturaClient("PROD");
  });

  // ─── getAllInvoicesByDateRange ─────────────────────────────────────────────

  describe("getAllInvoicesByDateRange", () => {
    const range = { startDate: "01/01/2024", endDate: "01/31/2024" };

    it("sends the correct GIB command", async () => {
      mockFetchOnce({ data: [] });
      await client.getAllInvoicesByDateRange(TOKEN, range);
      expect(getFetchCall().cmd).toBe("EARSIV_PORTAL_TASLAKLARI_GETIR");
    });

    it("sends the correct pageName", async () => {
      mockFetchOnce({ data: [] });
      await client.getAllInvoicesByDateRange(TOKEN, range);
      expect(getFetchCall().pageName).toBe("RG_BASITTASLAKLAR");
    });

    it("sends startDate as baslangic", async () => {
      mockFetchOnce({ data: [] });
      await client.getAllInvoicesByDateRange(TOKEN, range);
      expect(getFetchCall().jp["baslangic"]).toBe(range.startDate);
    });

    it("sends endDate as bitis", async () => {
      mockFetchOnce({ data: [] });
      await client.getAllInvoicesByDateRange(TOKEN, range);
      expect(getFetchCall().jp["bitis"]).toBe(range.endDate);
    });

    it("sends hangiTip as '5000/30000'", async () => {
      mockFetchOnce({ data: [] });
      await client.getAllInvoicesByDateRange(TOKEN, range);
      expect(getFetchCall().jp["hangiTip"]).toBe("5000/30000");
    });

    it("sends an empty table array", async () => {
      mockFetchOnce({ data: [] });
      await client.getAllInvoicesByDateRange(TOKEN, range);
      expect(getFetchCall().jp["table"]).toEqual([]);
    });

    it("returns result.data array", async () => {
      mockFetchOnce({ data: [invoiceListItem] });
      const result = await client.getAllInvoicesByDateRange(TOKEN, range);
      expect(result).toEqual([invoiceListItem]);
    });

    it("returns an empty array when no invoices found", async () => {
      mockFetchOnce({ data: [] });
      const result = await client.getAllInvoicesByDateRange(TOKEN, range);
      expect(result).toEqual([]);
    });

    it("returns multiple invoices", async () => {
      const second = { ...invoiceListItem, ettn: "aaaaaaaa-0000-1111-2222-333333333333" };
      mockFetchOnce({ data: [invoiceListItem, second] });
      const result = await client.getAllInvoicesByDateRange(TOKEN, range);
      expect(result).toHaveLength(2);
    });

    it("includes the token in the body", async () => {
      mockFetchOnce({ data: [] });
      await client.getAllInvoicesByDateRange(TOKEN, range);
      expect(getFetchCall().token).toBe(TOKEN);
    });
  });

  // ─── getAllInvoicesIssuedToMeByDateRange ──────────────────────────────────

  describe("getAllInvoicesIssuedToMeByDateRange", () => {
    const range = { startDate: "02/01/2024", endDate: "02/29/2024" };

    it("sends the correct GIB command", async () => {
      mockFetchOnce({ data: [] });
      await client.getAllInvoicesIssuedToMeByDateRange(TOKEN, range);
      expect(getFetchCall().cmd).toBe(
        "EARSIV_PORTAL_ADIMA_KESILEN_BELGELERI_GETIR"
      );
    });

    it("sends the correct pageName", async () => {
      mockFetchOnce({ data: [] });
      await client.getAllInvoicesIssuedToMeByDateRange(TOKEN, range);
      expect(getFetchCall().pageName).toBe("RG_ALICI_TASLAKLAR");
    });

    it("sends startDate as baslangic", async () => {
      mockFetchOnce({ data: [] });
      await client.getAllInvoicesIssuedToMeByDateRange(TOKEN, range);
      expect(getFetchCall().jp["baslangic"]).toBe(range.startDate);
    });

    it("sends endDate as bitis", async () => {
      mockFetchOnce({ data: [] });
      await client.getAllInvoicesIssuedToMeByDateRange(TOKEN, range);
      expect(getFetchCall().jp["bitis"]).toBe(range.endDate);
    });

    it("sends hangiTip as '5000/30000'", async () => {
      mockFetchOnce({ data: [] });
      await client.getAllInvoicesIssuedToMeByDateRange(TOKEN, range);
      expect(getFetchCall().jp["hangiTip"]).toBe("5000/30000");
    });

    it("returns result.data array", async () => {
      mockFetchOnce({ data: [invoiceListItem] });
      const result = await client.getAllInvoicesIssuedToMeByDateRange(TOKEN, range);
      expect(result).toEqual([invoiceListItem]);
    });

    it("uses a different command than getAllInvoicesByDateRange", async () => {
      mockFetchOnce({ data: [] });
      await client.getAllInvoicesIssuedToMeByDateRange(TOKEN, range);
      const cmd = getFetchCall().cmd;
      expect(cmd).not.toBe("EARSIV_PORTAL_TASLAKLARI_GETIR");
    });
  });
});
