import { describe, it, expect, vi, beforeEach } from "vitest";
import { FaturaClient } from "../../src/index";
import {
  minimalInvoice,
  draftInvoiceResponse,
  invoiceListItem,
} from "../fixtures/invoice.fixture";

const USER_ID = "gib-user";
const PASSWORD = "gib-pass";
const TOKEN = "session-token-abc";
const DRAFT_UUID = draftInvoiceResponse.uuid;

describe("FaturaClient — composite (high-level) methods", () => {
  let client: FaturaClient;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    client = new FaturaClient("PROD");
  });

  // ─── createInvoice ────────────────────────────────────────────────────────

  describe("createInvoice", () => {
    function setupHappyPath() {
      vi.spyOn(client, "getToken").mockResolvedValue(TOKEN);
      vi.spyOn(client, "createDraftInvoice").mockResolvedValue(draftInvoiceResponse);
      vi.spyOn(client, "findInvoice").mockResolvedValue(invoiceListItem);
      vi.spyOn(client, "signDraftInvoice").mockResolvedValue({ data: "ok" });
    }

    it("calls getToken with userId and password", async () => {
      setupHappyPath();
      await client.createInvoice(USER_ID, PASSWORD, minimalInvoice);
      expect(client.getToken).toHaveBeenCalledWith(USER_ID, PASSWORD);
    });

    it("calls createDraftInvoice with the received token", async () => {
      setupHappyPath();
      await client.createInvoice(USER_ID, PASSWORD, minimalInvoice);
      expect(client.createDraftInvoice).toHaveBeenCalledWith(TOKEN, minimalInvoice);
    });

    it("calls findInvoice with the draft returned by createDraftInvoice", async () => {
      setupHappyPath();
      await client.createInvoice(USER_ID, PASSWORD, minimalInvoice);
      expect(client.findInvoice).toHaveBeenCalledWith(TOKEN, draftInvoiceResponse);
    });

    it("calls signDraftInvoice when sign defaults to true", async () => {
      setupHappyPath();
      await client.createInvoice(USER_ID, PASSWORD, minimalInvoice);
      expect(client.signDraftInvoice).toHaveBeenCalledWith(TOKEN, invoiceListItem);
    });

    it("does NOT call signDraftInvoice when sign: false", async () => {
      setupHappyPath();
      await client.createInvoice(USER_ID, PASSWORD, minimalInvoice, { sign: false });
      expect(client.signDraftInvoice).not.toHaveBeenCalled();
    });

    it("does NOT call signDraftInvoice when findInvoice returns undefined", async () => {
      vi.spyOn(client, "getToken").mockResolvedValue(TOKEN);
      vi.spyOn(client, "createDraftInvoice").mockResolvedValue(draftInvoiceResponse);
      vi.spyOn(client, "findInvoice").mockResolvedValue(undefined);
      vi.spyOn(client, "signDraftInvoice").mockResolvedValue({ data: "ok" });

      await client.createInvoice(USER_ID, PASSWORD, minimalInvoice);
      expect(client.signDraftInvoice).not.toHaveBeenCalled();
    });

    it("returns token, uuid, and signed: true by default", async () => {
      setupHappyPath();
      const result = await client.createInvoice(USER_ID, PASSWORD, minimalInvoice);
      expect(result).toEqual({ token: TOKEN, uuid: DRAFT_UUID, signed: true });
    });

    it("returns signed: false when sign option is false", async () => {
      setupHappyPath();
      const result = await client.createInvoice(USER_ID, PASSWORD, minimalInvoice, {
        sign: false,
      });
      expect(result).toEqual({ token: TOKEN, uuid: DRAFT_UUID, signed: false });
    });

    it("calls methods in the correct order (getToken → createDraft → find → sign)", async () => {
      const callOrder: string[] = [];
      vi.spyOn(client, "getToken").mockImplementation(async () => {
        callOrder.push("getToken");
        return TOKEN;
      });
      vi.spyOn(client, "createDraftInvoice").mockImplementation(async () => {
        callOrder.push("createDraftInvoice");
        return draftInvoiceResponse;
      });
      vi.spyOn(client, "findInvoice").mockImplementation(async () => {
        callOrder.push("findInvoice");
        return invoiceListItem;
      });
      vi.spyOn(client, "signDraftInvoice").mockImplementation(async () => {
        callOrder.push("signDraftInvoice");
        return { data: "ok" };
      });

      await client.createInvoice(USER_ID, PASSWORD, minimalInvoice);
      expect(callOrder).toEqual([
        "getToken",
        "createDraftInvoice",
        "findInvoice",
        "signDraftInvoice",
      ]);
    });
  });

  // ─── createInvoiceAndGetDownloadURL ───────────────────────────────────────

  describe("createInvoiceAndGetDownloadURL", () => {
    it("returns a URL string", async () => {
      vi.spyOn(client, "createInvoice").mockResolvedValue({
        token: TOKEN,
        uuid: DRAFT_UUID,
        signed: true,
      });

      const result = await client.createInvoiceAndGetDownloadURL(
        USER_ID,
        PASSWORD,
        minimalInvoice
      );
      expect(typeof result).toBe("string");
      expect(result).toContain("download");
    });

    it("passes options through to createInvoice", async () => {
      const createInvoiceSpy = vi
        .spyOn(client, "createInvoice")
        .mockResolvedValue({ token: TOKEN, uuid: DRAFT_UUID, signed: false });

      await client.createInvoiceAndGetDownloadURL(USER_ID, PASSWORD, minimalInvoice, {
        sign: false,
      });
      expect(createInvoiceSpy).toHaveBeenCalledWith(
        USER_ID,
        PASSWORD,
        minimalInvoice,
        { sign: false }
      );
    });

    it("calls getDownloadURL with the token, uuid, and { signed } from createInvoice", async () => {
      vi.spyOn(client, "createInvoice").mockResolvedValue({
        token: TOKEN,
        uuid: DRAFT_UUID,
        signed: true,
      });
      const getDownloadURLSpy = vi.spyOn(client, "getDownloadURL");

      await client.createInvoiceAndGetDownloadURL(USER_ID, PASSWORD, minimalInvoice);
      expect(getDownloadURLSpy).toHaveBeenCalledWith(TOKEN, DRAFT_UUID, { signed: true });
    });

    it("[BUG FIX] passes { signed } object (not bare boolean) to getDownloadURL", async () => {
      // In original JS, `signed` (a boolean) was passed directly as the 3rd arg.
      // getDownloadURL expects { signed: boolean }. This verifies the fix.
      vi.spyOn(client, "createInvoice").mockResolvedValue({
        token: TOKEN,
        uuid: DRAFT_UUID,
        signed: false,
      });
      const spy = vi.spyOn(client, "getDownloadURL");

      await client.createInvoiceAndGetDownloadURL(USER_ID, PASSWORD, minimalInvoice);
      const thirdArg = spy.mock.calls[0][2];
      expect(thirdArg).toEqual({ signed: false });
      expect(typeof thirdArg).toBe("object");
    });
  });

  // ─── createInvoiceAndGetHTML ──────────────────────────────────────────────

  describe("createInvoiceAndGetHTML", () => {
    it("returns an HTML string", async () => {
      vi.spyOn(client, "createInvoice").mockResolvedValue({
        token: TOKEN,
        uuid: DRAFT_UUID,
        signed: true,
      });
      vi.spyOn(client, "getInvoiceHTML").mockResolvedValue("<html>Fatura</html>");

      const result = await client.createInvoiceAndGetHTML(
        USER_ID,
        PASSWORD,
        minimalInvoice
      );
      expect(result).toBe("<html>Fatura</html>");
    });

    it("passes options through to createInvoice", async () => {
      const createInvoiceSpy = vi
        .spyOn(client, "createInvoice")
        .mockResolvedValue({ token: TOKEN, uuid: DRAFT_UUID, signed: false });
      vi.spyOn(client, "getInvoiceHTML").mockResolvedValue("");

      await client.createInvoiceAndGetHTML(USER_ID, PASSWORD, minimalInvoice, {
        sign: false,
      });
      expect(createInvoiceSpy).toHaveBeenCalledWith(
        USER_ID,
        PASSWORD,
        minimalInvoice,
        { sign: false }
      );
    });

    it("calls getInvoiceHTML with token, uuid, and { signed } from createInvoice", async () => {
      vi.spyOn(client, "createInvoice").mockResolvedValue({
        token: TOKEN,
        uuid: DRAFT_UUID,
        signed: true,
      });
      const getHTMLSpy = vi
        .spyOn(client, "getInvoiceHTML")
        .mockResolvedValue("<html></html>");

      await client.createInvoiceAndGetHTML(USER_ID, PASSWORD, minimalInvoice);
      expect(getHTMLSpy).toHaveBeenCalledWith(TOKEN, DRAFT_UUID, { signed: true });
    });

    it("[BUG FIX] passes { signed } object (not bare boolean) to getInvoiceHTML", async () => {
      vi.spyOn(client, "createInvoice").mockResolvedValue({
        token: TOKEN,
        uuid: DRAFT_UUID,
        signed: false,
      });
      const spy = vi.spyOn(client, "getInvoiceHTML").mockResolvedValue("");

      await client.createInvoiceAndGetHTML(USER_ID, PASSWORD, minimalInvoice);
      const thirdArg = spy.mock.calls[0][2];
      expect(thirdArg).toEqual({ signed: false });
      expect(typeof thirdArg).toBe("object");
    });
  });
});
