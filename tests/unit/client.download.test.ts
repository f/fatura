import { describe, it, expect, vi, beforeEach } from "vitest";
import { FaturaClient } from "../../src/index";
import { mockFetchOnce, getFetchCall } from "../helpers/mock-fetch";
import { ENV } from "../../src/constants/environment";
import { TOKEN } from "../fixtures/invoice.fixture";

const INVOICE_UUID = "11111111-2222-1333-a444-555555555555";

describe("FaturaClient — download & HTML", () => {
  let prodClient: FaturaClient;
  let testClient: FaturaClient;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    prodClient = new FaturaClient("PROD");
    testClient = new FaturaClient("TEST");
  });

  // ─── getInvoiceHTML ───────────────────────────────────────────────────────

  describe("getInvoiceHTML", () => {
    it("sends the correct GIB command", async () => {
      mockFetchOnce({ data: "<html>...</html>" });
      await prodClient.getInvoiceHTML(TOKEN, INVOICE_UUID, { signed: true });
      expect(getFetchCall().cmd).toBe("EARSIV_PORTAL_FATURA_GOSTER");
    });

    it("sends the correct pageName", async () => {
      mockFetchOnce({ data: "<html>...</html>" });
      await prodClient.getInvoiceHTML(TOKEN, INVOICE_UUID, { signed: true });
      expect(getFetchCall().pageName).toBe("RG_BASITTASLAKLAR");
    });

    it("sends the invoice uuid as ettn", async () => {
      mockFetchOnce({ data: "<html>...</html>" });
      await prodClient.getInvoiceHTML(TOKEN, INVOICE_UUID, { signed: true });
      expect(getFetchCall().jp["ettn"]).toBe(INVOICE_UUID);
    });

    it("signed: true → onayDurumu is 'Onaylandı'", async () => {
      mockFetchOnce({ data: "<html>...</html>" });
      await prodClient.getInvoiceHTML(TOKEN, INVOICE_UUID, { signed: true });
      expect(getFetchCall().jp["onayDurumu"]).toBe("Onaylandı");
    });

    it("signed: false → onayDurumu is 'Onaylanmadı'", async () => {
      mockFetchOnce({ data: "<html>...</html>" });
      await prodClient.getInvoiceHTML(TOKEN, INVOICE_UUID, { signed: false });
      expect(getFetchCall().jp["onayDurumu"]).toBe("Onaylanmadı");
    });

    it("returns result.data (the HTML string)", async () => {
      const html = "<html><body>Fatura içeriği</body></html>";
      mockFetchOnce({ data: html });
      const result = await prodClient.getInvoiceHTML(TOKEN, INVOICE_UUID, { signed: true });
      expect(result).toBe(html);
    });

    it("includes the token in the body", async () => {
      mockFetchOnce({ data: "" });
      await prodClient.getInvoiceHTML(TOKEN, INVOICE_UUID, { signed: true });
      expect(getFetchCall().token).toBe(TOKEN);
    });
  });

  // ─── getDownloadURL ───────────────────────────────────────────────────────

  describe("getDownloadURL", () => {
    it("is a synchronous function (no await needed)", () => {
      const result = prodClient.getDownloadURL(TOKEN, INVOICE_UUID, { signed: true });
      expect(typeof result).toBe("string");
    });

    it("uses the PROD base URL", () => {
      const url = prodClient.getDownloadURL(TOKEN, INVOICE_UUID, { signed: true });
      expect(url).toContain(ENV.PROD.BASE_URL);
    });

    it("uses the TEST base URL for test client", () => {
      const url = testClient.getDownloadURL(TOKEN, INVOICE_UUID, { signed: true });
      expect(url).toContain(ENV.TEST.BASE_URL);
    });

    it("contains the /earsiv-services/download path", () => {
      const url = prodClient.getDownloadURL(TOKEN, INVOICE_UUID, { signed: true });
      expect(url).toContain("/earsiv-services/download");
    });

    it("includes the token as a query parameter", () => {
      const url = prodClient.getDownloadURL(TOKEN, INVOICE_UUID, { signed: true });
      expect(url).toContain(`token=${TOKEN}`);
    });

    it("includes the invoice UUID as ettn", () => {
      const url = prodClient.getDownloadURL(TOKEN, INVOICE_UUID, { signed: true });
      expect(url).toContain(`ettn=${INVOICE_UUID}`);
    });

    it("includes belgeTip=FATURA", () => {
      const url = prodClient.getDownloadURL(TOKEN, INVOICE_UUID, { signed: true });
      expect(url).toContain("belgeTip=FATURA");
    });

    it("signed: true → onayDurumu contains 'Onaylandı' (percent-encoded)", () => {
      const url = prodClient.getDownloadURL(TOKEN, INVOICE_UUID, { signed: true });
      expect(url).toContain(encodeURIComponent("Onaylandı"));
    });

    it("signed: false → onayDurumu contains 'Onaylanmadı' (percent-encoded)", () => {
      const url = prodClient.getDownloadURL(TOKEN, INVOICE_UUID, { signed: false });
      expect(url).toContain(encodeURIComponent("Onaylanmadı"));
    });

    it("includes cmd=downloadResource", () => {
      const url = prodClient.getDownloadURL(TOKEN, INVOICE_UUID, { signed: true });
      expect(url).toContain("cmd=downloadResource");
    });

    it("Turkish characters in onayDurumu are properly percent-encoded", () => {
      const url = prodClient.getDownloadURL(TOKEN, INVOICE_UUID, { signed: true });
      // Raw Turkish chars must not appear unencoded in the URL
      expect(url).not.toContain("Onaylandı");
      expect(url).toContain("%C4%B1"); // 'ı' encoded
    });

    it("signed and unsigned URLs are different", () => {
      const signed = prodClient.getDownloadURL(TOKEN, INVOICE_UUID, { signed: true });
      const unsigned = prodClient.getDownloadURL(TOKEN, INVOICE_UUID, { signed: false });
      expect(signed).not.toBe(unsigned);
    });
  });
});
