import { describe, it, expect, vi, beforeEach } from "vitest";
import { FaturaClient } from "../../src/index";
import { mockFetchOnce, getFetchCall } from "../helpers/mock-fetch";
import { TOKEN } from "../fixtures/invoice.fixture";
import { userData, rawUserData } from "../fixtures/user.fixture";

describe("FaturaClient — user operations", () => {
    let client: FaturaClient;

    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
        client = new FaturaClient("PROD");
    });

    // ─── getUserData ──────────────────────────────────────────────────────────

    describe("getUserData", () => {
        it("sends the correct GIB command", async () => {
            mockFetchOnce({ data: rawUserData });
            await client.getUserData(TOKEN);
            expect(getFetchCall().cmd).toBe("EARSIV_PORTAL_KULLANICI_BILGILERI_GETIR");
        });

        it("sends the correct pageName", async () => {
            mockFetchOnce({ data: rawUserData });
            await client.getUserData(TOKEN);
            expect(getFetchCall().pageName).toBe("RG_KULLANICI");
        });

        it("maps vknTckn → taxIDOrTRID", async () => {
            mockFetchOnce({ data: rawUserData });
            const result = await client.getUserData(TOKEN);
            expect(result.taxIDOrTRID).toBe(rawUserData.vknTckn);
        });

        it("maps unvan → title", async () => {
            mockFetchOnce({ data: rawUserData });
            const result = await client.getUserData(TOKEN);
            expect(result.title).toBe(rawUserData.unvan);
        });

        it("maps ad → name", async () => {
            mockFetchOnce({ data: rawUserData });
            const result = await client.getUserData(TOKEN);
            expect(result.name).toBe(rawUserData.ad);
        });

        it("maps soyad → surname", async () => {
            mockFetchOnce({ data: rawUserData });
            const result = await client.getUserData(TOKEN);
            expect(result.surname).toBe(rawUserData.soyad);
        });

        it("maps sicilNo → registryNo", async () => {
            mockFetchOnce({ data: rawUserData });
            const result = await client.getUserData(TOKEN);
            expect(result.registryNo).toBe(rawUserData.sicilNo);
        });

        it("maps mersisNo → mersisNo", async () => {
            mockFetchOnce({ data: rawUserData });
            const result = await client.getUserData(TOKEN);
            expect(result.mersisNo).toBe(rawUserData.mersisNo);
        });

        it("maps vergiDairesi → taxOffice", async () => {
            mockFetchOnce({ data: rawUserData });
            const result = await client.getUserData(TOKEN);
            expect(result.taxOffice).toBe(rawUserData.vergiDairesi);
        });

        it("maps cadde → fullAddress", async () => {
            mockFetchOnce({ data: rawUserData });
            const result = await client.getUserData(TOKEN);
            expect(result.fullAddress).toBe(rawUserData.cadde);
        });

        it("maps apartmanAdi → buildingName", async () => {
            mockFetchOnce({ data: rawUserData });
            const result = await client.getUserData(TOKEN);
            expect(result.buildingName).toBe(rawUserData.apartmanAdi);
        });

        it("maps apartmanNo → buildingNumber", async () => {
            mockFetchOnce({ data: rawUserData });
            const result = await client.getUserData(TOKEN);
            expect(result.buildingNumber).toBe(rawUserData.apartmanNo);
        });

        it("maps kapiNo → doorNumber", async () => {
            mockFetchOnce({ data: rawUserData });
            const result = await client.getUserData(TOKEN);
            expect(result.doorNumber).toBe(rawUserData.kapiNo);
        });

        it("maps kasaba → town", async () => {
            mockFetchOnce({ data: rawUserData });
            const result = await client.getUserData(TOKEN);
            expect(result.town).toBe(rawUserData.kasaba);
        });

        it("maps ilce → district", async () => {
            mockFetchOnce({ data: rawUserData });
            const result = await client.getUserData(TOKEN);
            expect(result.district).toBe(rawUserData.ilce);
        });

        it("maps il → city", async () => {
            mockFetchOnce({ data: rawUserData });
            const result = await client.getUserData(TOKEN);
            expect(result.city).toBe(rawUserData.il);
        });

        it("maps postaKodu → zipCode", async () => {
            mockFetchOnce({ data: rawUserData });
            const result = await client.getUserData(TOKEN);
            expect(result.zipCode).toBe(rawUserData.postaKodu);
        });

        it("maps ulke → country", async () => {
            mockFetchOnce({ data: rawUserData });
            const result = await client.getUserData(TOKEN);
            expect(result.country).toBe(rawUserData.ulke);
        });

        it("maps telNo → phoneNumber", async () => {
            mockFetchOnce({ data: rawUserData });
            const result = await client.getUserData(TOKEN);
            expect(result.phoneNumber).toBe(rawUserData.telNo);
        });

        it("maps faksNo → faxNumber", async () => {
            mockFetchOnce({ data: rawUserData });
            const result = await client.getUserData(TOKEN);
            expect(result.faxNumber).toBe(rawUserData.faksNo);
        });

        it("maps ePostaAdresi → email", async () => {
            mockFetchOnce({ data: rawUserData });
            const result = await client.getUserData(TOKEN);
            expect(result.email).toBe(rawUserData.ePostaAdresi);
        });

        it("maps webSitesiAdresi → webSite", async () => {
            mockFetchOnce({ data: rawUserData });
            const result = await client.getUserData(TOKEN);
            expect(result.webSite).toBe(rawUserData.webSitesiAdresi);
        });

        it("maps isMerkezi → businessCenter", async () => {
            mockFetchOnce({ data: rawUserData });
            const result = await client.getUserData(TOKEN);
            expect(result.businessCenter).toBe(rawUserData.isMerkezi);
        });

        it("returns an object with all UserData fields populated", async () => {
            mockFetchOnce({ data: rawUserData });
            const result = await client.getUserData(TOKEN);
            expect(result).toEqual(userData);
        });
    });

    // ─── updateUserData ───────────────────────────────────────────────────────

    describe("updateUserData", () => {
        it("sends the correct GIB command", async () => {
            mockFetchOnce({ data: "ok" });
            await client.updateUserData(TOKEN, userData);
            expect(getFetchCall().cmd).toBe("EARSIV_PORTAL_KULLANICI_BILGILERI_KAYDET");
        });

        it("sends the correct pageName", async () => {
            mockFetchOnce({ data: "ok" });
            await client.updateUserData(TOKEN, userData);
            expect(getFetchCall().pageName).toBe("RG_KULLANICI");
        });

        it("maps taxIDOrTRID → vknTckn", async () => {
            mockFetchOnce({ data: "ok" });
            await client.updateUserData(TOKEN, userData);
            expect(getFetchCall().jp["vknTckn"]).toBe(userData.taxIDOrTRID);
        });

        it("maps title → unvan", async () => {
            mockFetchOnce({ data: "ok" });
            await client.updateUserData(TOKEN, userData);
            expect(getFetchCall().jp["unvan"]).toBe(userData.title);
        });

        it("maps name → ad", async () => {
            mockFetchOnce({ data: "ok" });
            await client.updateUserData(TOKEN, userData);
            expect(getFetchCall().jp["ad"]).toBe(userData.name);
        });

        it("maps surname → soyad", async () => {
            mockFetchOnce({ data: "ok" });
            await client.updateUserData(TOKEN, userData);
            expect(getFetchCall().jp["soyad"]).toBe(userData.surname);
        });

        it("maps taxOffice → vergiDairesi", async () => {
            mockFetchOnce({ data: "ok" });
            await client.updateUserData(TOKEN, userData);
            expect(getFetchCall().jp["vergiDairesi"]).toBe(userData.taxOffice);
        });

        it("maps fullAddress → cadde", async () => {
            mockFetchOnce({ data: "ok" });
            await client.updateUserData(TOKEN, userData);
            expect(getFetchCall().jp["cadde"]).toBe(userData.fullAddress);
        });

        it("maps city → il", async () => {
            mockFetchOnce({ data: "ok" });
            await client.updateUserData(TOKEN, userData);
            expect(getFetchCall().jp["il"]).toBe(userData.city);
        });

        it("maps email → ePostaAdresi", async () => {
            mockFetchOnce({ data: "ok" });
            await client.updateUserData(TOKEN, userData);
            expect(getFetchCall().jp["ePostaAdresi"]).toBe(userData.email);
        });

        it("maps phoneNumber → telNo", async () => {
            mockFetchOnce({ data: "ok" });
            await client.updateUserData(TOKEN, userData);
            expect(getFetchCall().jp["telNo"]).toBe(userData.phoneNumber);
        });

        it("maps businessCenter → isMerkezi", async () => {
            mockFetchOnce({ data: "ok" });
            await client.updateUserData(TOKEN, userData);
            expect(getFetchCall().jp["isMerkezi"]).toBe(userData.businessCenter);
        });

        it("returns result.data", async () => {
            mockFetchOnce({ data: { updated: true } });
            const result = await client.updateUserData(TOKEN, userData);
            expect(result).toEqual({ updated: true });
        });
    });
});
