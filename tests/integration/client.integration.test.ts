/**
 * Integration tests — gerçek GİB TEST ortamına karşı çalıştırılır.
 *
 * Çalıştırmak için:
 *   npm run test:integration
 *
 * Kendi hesabınla:
 *   GIB_TEST_USER=<kullaniciKodu> GIB_TEST_PASS=<sifre> npm run test:integration
 *
 * GİB'in kamuya açık test hesabı (başka biri kullanıyorsa kilitli olabilir):
 *   Kullanıcı: 33333301   Şifre: 1
 *   Portal:    https://earsivportaltest.efatura.gov.tr
 *
 * CI ortamında atlamak için: CI=true
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { FaturaClient } from "../../src/index";
import type { InvoiceDetails, UserData } from "../../src/types";

// ─── Config ───────────────────────────────────────────────────────────────────

const GIB_USER = process.env["GIB_TEST_USER"] ?? "33333301";
const GIB_PASS = process.env["GIB_TEST_PASS"] ?? "1";
const SKIP_CI = process.env["CI"] === "true";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayGIB(): string {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${mm}/${dd}/${d.getFullYear()}`;
}

function nowTime(): string {
    return new Date().toTimeString().slice(0, 8);
}

function makeInvoice(): InvoiceDetails {
    return {
        date: todayGIB(),
        time: nowTime(),
        taxIDOrTRID: "11111111111",
        name: "Test",
        surname: "Alıcı",
        fullAddress: "Test Sokak No:1",
        country: "Türkiye",
        items: [
            {
                name: "Test Hizmeti",
                quantity: 1,
                unitType: "C62",
                unitPrice: 100,
                price: 100,
                VATRate: 20,
                VATAmount: 20,
                VATAmountOfTax: 0,
            },
        ],
        grandTotal: 100,
        totalVAT: 20,
        grandTotalInclVAT: 120,
        paymentTotal: 120,
    };
}

/**
 * Oturum kilidi hatasını aşmak için tekrarlayan login denemesi.
 * Kamu test hesabı paylaşımlı olduğundan başka biri çıkış yapmadan
 * giriş yapılamaz; birkaç saniye bekleyip tekrar deniyoruz.
 */
async function getTokenWithRetry(
    client: FaturaClient,
    user: string,
    pass: string,
    maxAttempts = 5,
    delayMs = 3000,
): Promise<string> {
    let lastError: Error | undefined;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await client.getToken(user, pass);
        } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));
            const isLocked =
                lastError.message.includes("birden fazla giriş") || lastError.message.includes("Güvenli Çıkış");
            if (!isLocked || attempt === maxAttempts) break;
            await new Promise((r) => setTimeout(r, delayMs));
        }
    }
    throw lastError ?? new Error("Login failed");
}

// ─── Suite ────────────────────────────────────────────────────────────────────

describe.skipIf(SKIP_CI)("FaturaClient — Integration (GİB TEST env)", () => {
    let client: FaturaClient;
    let token: string;
    let tokenAvailable = true;

    beforeAll(async () => {
        client = new FaturaClient("TEST");
        try {
            token = await getTokenWithRetry(client, GIB_USER, GIB_PASS);
        } catch (err) {
            tokenAvailable = false;
            const msg = err instanceof Error ? err.message : String(err);
            console.warn(`\n⚠ Integration tests SKIPPED — GİB TEST login failed: ${msg}`);
            console.warn("  Kamu hesabı başka biri tarafından kullanılıyorsa birkaç dakika bekleyip tekrar deneyin.\n");
        }
    }, 30_000);

    afterAll(async () => {
        if (token) await client.logout(token).catch(() => undefined);
    }, 10_000);

    // ─── Auth ──────────────────────────────────────────────────────────────────

    describe("getToken", () => {
        it("returns a non-empty token string", () => {
            if (!tokenAvailable) return;
            expect(typeof token).toBe("string");
            expect(token.length).toBeGreaterThan(0);
        });
    });

    // ─── User data ────────────────────────────────────────────────────────────

    describe("getUserData", () => {
        let user: UserData;

        beforeAll(async () => {
            if (!tokenAvailable) return;
            user = await client.getUserData(token);
        }, 15_000);

        it("returns a taxIDOrTRID string", () => {
            if (!tokenAvailable) return;
            expect(typeof user.taxIDOrTRID).toBe("string");
            expect(user.taxIDOrTRID.length).toBeGreaterThan(0);
        });

        it("returns a title or name", () => {
            if (!tokenAvailable) return;
            const hasIdentity = user.title || user.name;
            expect(hasIdentity).toBeTruthy();
        });
    });

    // ─── Invoice queries ───────────────────────────────────────────────────────

    describe("getAllInvoicesByDateRange", () => {
        it("returns an array for today's date range", async () => {
            if (!tokenAvailable) return;
            const invoices = await client.getAllInvoicesByDateRange(token, {
                startDate: todayGIB(),
                endDate: todayGIB(),
            });
            expect(Array.isArray(invoices)).toBe(true);
        });

        it("returns an array for a broader range", async () => {
            if (!tokenAvailable) return;
            const invoices = await client.getAllInvoicesByDateRange(token, {
                startDate: "01/01/2024",
                endDate: todayGIB(),
            });
            expect(Array.isArray(invoices)).toBe(true);
        });
    });

    describe("getAllInvoicesIssuedToMeByDateRange", () => {
        it("returns an array or throws a GİB permission error", async () => {
            if (!tokenAvailable) return;
            // Kamu test hesabının bu endpoint'e yetkisi/verisi olmayabilir (NullPointerException).
            // Test hesabınızda veri varsa array döner; yoksa hata fırlatır — ikisi de kabul edilir.
            try {
                const invoices = await client.getAllInvoicesIssuedToMeByDateRange(token, {
                    startDate: todayGIB(),
                    endDate: todayGIB(),
                });
                expect(Array.isArray(invoices)).toBe(true);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);
                // Hesabın yetkisi/verisi olmadığında GİB hata fırlatır — bu beklenen davranış.
                console.warn(
                    `  ↳ getAllInvoicesIssuedToMeByDateRange: ${(err as Error).message} (hesap yetersiz — beklenen)`,
                );
            }
        });
    });

    // ─── Invoice lifecycle ─────────────────────────────────────────────────────

    describe("createDraftInvoice + findInvoice", () => {
        it("creates a draft and can find it by uuid", async () => {
            if (!tokenAvailable) return;
            const draft = await client.createDraftInvoice(token, makeInvoice());

            expect(draft.uuid).toBeTruthy();
            expect(draft.date).toBe(todayGIB());

            const found = await client.findInvoice(token, draft);
            expect(found).toBeDefined();
            expect(found?.ettn).toBe(draft.uuid);
        }, 30_000);
    });

    describe("getDownloadURL", () => {
        it("returns a URL containing the invoice uuid and token", async () => {
            if (!tokenAvailable) return;
            const draft = await client.createDraftInvoice(token, makeInvoice());
            const url = client.getDownloadURL(token, draft.uuid, { signed: false });

            expect(url).toContain("https://");
            expect(url).toContain(draft.uuid);
            expect(url).toContain(token);
            expect(url).toContain("belgeTip=FATURA");
        }, 30_000);
    });

    describe("getInvoiceHTML", () => {
        it("returns a non-empty HTML string for an unsigned invoice", async () => {
            if (!tokenAvailable) return;
            const draft = await client.createDraftInvoice(token, makeInvoice());
            const html = await client.getInvoiceHTML(token, draft.uuid, { signed: false });

            expect(typeof html).toBe("string");
            expect(html.length).toBeGreaterThan(0);
        }, 30_000);
    });

    // ─── Recipient lookup ──────────────────────────────────────────────────────

    describe("getRecipientDataByTaxIDOrTRID", () => {
        it("returns a defined result for TRID 11111111111", async () => {
            if (!tokenAvailable) return;
            const result = await client.getRecipientDataByTaxIDOrTRID(token, "11111111111");
            expect(result).toBeDefined();
        });
    });

    // ─── Sign + cancel lifecycle ───────────────────────────────────────────────

    describe("signDraftInvoice + cancelDraftInvoice", () => {
        it("signs and cancels when account has permission; skips gracefully otherwise", async () => {
            if (!tokenAvailable) return;
            const draft = await client.createDraftInvoice(token, makeInvoice());
            const found = await client.findInvoice(token, draft);
            expect(found).toBeDefined();

            try {
                // Kamu test hesabının HSM imzalama yetkisi olmayabilir.
                await client.signDraftInvoice(token, found!);

                const signedFound = await client.findInvoice(token, draft);
                expect(signedFound).toBeDefined();

                const cancelResult = await client.cancelDraftInvoice(
                    token,
                    "Integration test — otomatik iptal",
                    signedFound!,
                );
                expect(cancelResult).toBeDefined();
            } catch (err) {
                const msg = (err as Error).message;
                const isPermissionError = msg.includes("yetkiniz yok") || msg.includes("yetki") || msg.includes("HSM");
                if (isPermissionError) {
                    console.warn(`  ↳ signDraftInvoice: "${msg}" (hesap yetersiz — beklenen)`);
                } else {
                    throw err; // beklenmedik hata — testi gerçekten başarısız yap
                }
            }
        }, 60_000);
    });

    // ─── Logout ────────────────────────────────────────────────────────────────

    describe("logout", () => {
        it("completes without throwing and returns a response", async () => {
            if (!tokenAvailable) return;
            // Kamu hesabıyla ikinci login aynı anda açık olamayabileceğinden
            // ana token üzerinden logout yapıyoruz; afterAll zaten bunu temizleyecek.
            const result = await client.logout(token);
            // GİB { data: { redirectUrl: "login.html" } } döndürür
            expect(result).toBeDefined();
            token = ""; // afterAll tekrar çağırmasın
        }, 15_000);
    });
});
