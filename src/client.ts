import { randomUUID } from "crypto";
import { convertPriceToText } from "./utils/number";
import { ENV } from "./constants/environment";
import { COMMANDS } from "./constants/commands";
import type {
    EnvironmentKey,
    ApiResponse,
    GibAuthResponse,
    InvoiceListItem,
    InvoiceItem,
    InvoiceDetails,
    DraftInvoice,
    CreateInvoiceResult,
    UserData,
    RawUserData,
} from "./types";

/** GİB API hata mesajını okur ve varsa Error fırlatır. */
function assertApiSuccess(response: ApiResponse | GibAuthResponse): void {
    if (response.error && response.error !== "0") {
        const raw = response.messages?.[0];
        const text =
            typeof raw === "string" ? raw : typeof raw === "object" && raw !== null ? raw.text : "GİB API hatası";
        throw new Error(text ?? "GİB API hatası");
    }
}

// ─── Internal types ──────────────────────────────────────────────────────────

interface DateRange {
    startDate: string;
    endDate: string;
}

interface SignedOptions {
    signed: boolean;
}

interface CreateInvoiceOptions {
    sign?: boolean;
}

interface SmsResponse {
    oid?: string;
}

interface MalHizmetRow {
    iskontoArttm: string;
    malHizmet: string;
    miktar: number;
    birim: string;
    birimFiyat: string;
    fiyat: string;
    iskontoOrani: number;
    iskontoTutari: string;
    iskontoNedeni: string;
    malHizmetTutari: string;
    kdvOrani: string;
    vergiOrani: number;
    kdvTutari: string;
    vergininKdvTutari: string;
}

// ─── FaturaClient ─────────────────────────────────────────────────────────────

export class FaturaClient {
    private readonly baseURL: string;
    private readonly loginCmd: string;
    private readonly logoutCmd: string;

    constructor(env: EnvironmentKey = "PROD") {
        this.baseURL = ENV[env].BASE_URL;
        this.loginCmd = env === "PROD" ? "anologin" : "login";
        this.logoutCmd = env === "PROD" ? "anologin" : "logout";
    }

    // ─── Core HTTP ─────────────────────────────────────────────────────────────

    private buildHeaders(): Record<string, string> {
        return {
            accept: "*/*",
            "accept-language": "tr,en-US;q=0.9,en;q=0.8",
            "cache-control": "no-cache",
            "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
            pragma: "no-cache",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
        };
    }

    private async runCommand<T = unknown>(
        token: string,
        command: string,
        pageName: string,
        data: Record<string, unknown> = {},
    ): Promise<T> {
        const response = await fetch(`${this.baseURL}/earsiv-services/dispatch`, {
            method: "POST",
            headers: this.buildHeaders(),
            body: `cmd=${command}&callid=${randomUUID()}&pageName=${pageName}&token=${token}&jp=${encodeURIComponent(
                JSON.stringify(data),
            )}`,
        });
        const json = (await response.json()) as ApiResponse;
        assertApiSuccess(json);
        return json as T;
    }

    // ─── Auth ──────────────────────────────────────────────────────────────────

    async getToken(userName: string, password: string): Promise<string> {
        const response = await fetch(`${this.baseURL}/earsiv-services/assos-login`, {
            method: "POST",
            headers: this.buildHeaders(),
            body: `assoscmd=${this.loginCmd}&rtype=json&userid=${userName}&sifre=${password}&sifre2=${password}&parola=1&`,
        });
        const json = (await response.json()) as GibAuthResponse;
        assertApiSuccess(json);
        return json.token!;
    }

    async logout(token: string): Promise<unknown> {
        const response = await fetch(`${this.baseURL}/earsiv-services/assos-login`, {
            method: "POST",
            headers: this.buildHeaders(),
            body: `assoscmd=${this.logoutCmd}&rtype=json&token=${token}&`,
        });
        const json = (await response.json()) as GibAuthResponse;
        return json.data;
    }

    // ─── Invoice CRUD ──────────────────────────────────────────────────────────

    async createDraftInvoice(token: string, invoiceDetails: InvoiceDetails): Promise<DraftInvoice> {
        const faturaUuid = invoiceDetails.uuid ?? randomUUID();
        const invoiceData: Record<string, unknown> = {
            faturaUuid,
            belgeNumarasi: invoiceDetails.documentNumber ?? "",
            faturaTarihi: invoiceDetails.date,
            saat: invoiceDetails.time,
            paraBirimi: invoiceDetails.currency ?? "TRY",
            dovzTLkur: invoiceDetails.currencyRate ?? "0",
            faturaTipi: invoiceDetails.invoiceType ?? "5000/30000",
            hangiTip: invoiceDetails.hangiTip ?? "Buyuk",
            siparisNumarasi: invoiceDetails.orderNumber ?? "",
            siparisTarihi: invoiceDetails.orderDate ?? "",
            irsaliyeNumarasi: invoiceDetails.dispatchNumber ?? "",
            irsaliyeTarihi: invoiceDetails.dispatchDate ?? "",
            fisNo: invoiceDetails.slipNumber ?? "",
            fisTarihi: invoiceDetails.slipDate ?? "",
            fisSaati: invoiceDetails.slipTime ?? " ",
            fisTipi: invoiceDetails.slipType ?? " ",
            zRaporNo: invoiceDetails.zReportNumber ?? "",
            okcSeriNo: invoiceDetails.okcSerialNumber ?? "",
            vknTckn: invoiceDetails.taxIDOrTRID ?? "11111111111",
            aliciUnvan: invoiceDetails.title ?? "",
            aliciAdi: invoiceDetails.name ?? "",
            aliciSoyadi: invoiceDetails.surname ?? "",
            bulvarcaddesokak: invoiceDetails.fullAddress ?? "",
            binaAdi: invoiceDetails.buildingName ?? "",
            binaNo: invoiceDetails.buildingNumber ?? "",
            kapiNo: invoiceDetails.doorNumber ?? "",
            kasabaKoy: invoiceDetails.town ?? "",
            mahalleSemtIlce: invoiceDetails.district ?? "",
            sehir: invoiceDetails.city ?? " ",
            ulke: invoiceDetails.country ?? "",
            postaKodu: invoiceDetails.zipCode ?? "",
            tel: invoiceDetails.phoneNumber ?? "",
            fax: invoiceDetails.faxNumber ?? "",
            eposta: invoiceDetails.email ?? "",
            websitesi: invoiceDetails.webSite ?? "",
            vergiDairesi: invoiceDetails.taxOffice ?? "",
            komisyonOrani: invoiceDetails.commissionRate ?? 0,
            navlunOrani: invoiceDetails.freightRate ?? 0,
            hammaliyeOrani: invoiceDetails.hammaliyeOrani ?? 0,
            nakliyeOrani: invoiceDetails.nakliyeOrani ?? 0,
            komisyonTutari: invoiceDetails.komisyonTutari ?? "0",
            navlunTutari: invoiceDetails.navlunTutari ?? "0",
            hammaliyeTutari: invoiceDetails.hammaliyeTutari ?? "0",
            nakliyeTutari: invoiceDetails.nakliyeTutari ?? "0",
            komisyonKDVOrani: invoiceDetails.komisyonKDVOrani ?? 0,
            navlunKDVOrani: invoiceDetails.navlunKDVOrani ?? 0,
            hammaliyeKDVOrani: invoiceDetails.hammaliyeKDVOrani ?? 0,
            nakliyeKDVOrani: invoiceDetails.nakliyeKDVOrani ?? 0,
            komisyonKDVTutari: invoiceDetails.komisyonKDVTutari ?? "0",
            navlunKDVTutari: invoiceDetails.navlunKDVTutari ?? "0",
            hammaliyeKDVTutari: invoiceDetails.hammaliyeKDVTutari ?? "0",
            nakliyeKDVTutari: invoiceDetails.nakliyeKDVTutari ?? "0",
            gelirVergisiOrani: invoiceDetails.gelirVergisiOrani ?? 0,
            bagkurTevkifatiOrani: invoiceDetails.bagkurTevkifatiOrani ?? 0,
            gelirVergisiTevkifatiTutari: invoiceDetails.gelirVergisiTevkifatiTutari ?? "0",
            bagkurTevkifatiTutari: invoiceDetails.bagkurTevkifatiTutari ?? "0",
            halRusumuOrani: invoiceDetails.halRusumuOrani ?? 0,
            ticaretBorsasiOrani: invoiceDetails.ticaretBorsasiOrani ?? 0,
            milliSavunmaFonuOrani: invoiceDetails.milliSavunmaFonuOrani ?? 0,
            digerOrani: invoiceDetails.digerOrani ?? 0,
            halRusumuTutari: invoiceDetails.halRusumuTutari ?? "0",
            ticaretBorsasiTutari: invoiceDetails.ticaretBorsasiTutari ?? "0",
            milliSavunmaFonuTutari: invoiceDetails.milliSavunmaFonuTutari ?? "0",
            digerTutari: invoiceDetails.digerTutari ?? "0",
            halRusumuKDVOrani: invoiceDetails.halRusumuKDVOrani ?? 0,
            ticaretBorsasiKDVOrani: invoiceDetails.ticaretBorsasiKDVOrani ?? 0,
            milliSavunmaFonuKDVOrani: invoiceDetails.milliSavunmaFonuKDVOrani ?? 0,
            digerKDVOrani: invoiceDetails.digerKDVOrani ?? 0,
            halRusumuKDVTutari: invoiceDetails.halRusumuKDVTutari ?? "0",
            ticaretBorsasiKDVTutari: invoiceDetails.ticaretBorsasiKDVTutari ?? "0",
            milliSavunmaFonuKDVTutari: invoiceDetails.milliSavunmaFonuKDVTutari ?? "0",
            digerKDVTutari: invoiceDetails.digerKDVTutari ?? "0",
            iadeTable: (invoiceDetails.returnItems ?? []).map(() => ({})),
            ozelMatrahTutari: invoiceDetails.specialTaxBaseAmount ?? "0",
            ozelMatrahOrani: invoiceDetails.specialTaxBaseRate ?? 0,
            ozelMatrahVergiTutari: (invoiceDetails.specialTaxBaseTaxAmount ?? 0).toFixed(2),
            vergiCesidi: invoiceDetails.taxType ?? " ",
            malHizmetTable: invoiceDetails.items.map(
                (item: InvoiceItem): MalHizmetRow => ({
                    iskontoArttm: item.discount ?? "İskonto",
                    malHizmet: item.name,
                    miktar: item.quantity ?? 1,
                    birim: item.unitType ?? "C62",
                    birimFiyat: (item.unitPrice ?? 0).toFixed(2),
                    fiyat: item.price.toFixed(2),
                    iskontoOrani: item.discountRate ?? 0,
                    iskontoTutari: (item.discountAmount ?? 0).toFixed(2),
                    iskontoNedeni: item.discountReason ?? "",
                    malHizmetTutari: ((item.quantity ?? 0) * (item.unitPrice ?? 0)).toFixed(2),
                    kdvOrani: (item.VATRate ?? 0).toFixed(0),
                    vergiOrani: item.taxRate ?? 0,
                    kdvTutari: (item.VATAmount ?? 0).toFixed(2),
                    vergininKdvTutari: (item.VATAmountOfTax ?? 0).toFixed(2),
                }),
            ),
            tip: "İskonto",
            matrah: invoiceDetails.grandTotal.toFixed(2),
            malhizmetToplamTutari: invoiceDetails.grandTotal.toFixed(2),
            toplamIskonto: (invoiceDetails.totalDiscount ?? 0).toFixed(2),
            hesaplanankdv: invoiceDetails.totalVAT.toFixed(2),
            vergilerToplami: invoiceDetails.totalVAT.toFixed(2),
            vergilerDahilToplamTutar: invoiceDetails.grandTotalInclVAT.toFixed(2),
            toplamMasraflar: invoiceDetails.toplamMasraflar ?? "0",
            odenecekTutar: invoiceDetails.paymentTotal.toFixed(2),
            not: convertPriceToText(invoiceDetails.paymentTotal),
        };

        const invoice = await this.runCommand<ApiResponse>(token, ...COMMANDS.createDraftInvoice, invoiceData);

        return { date: invoiceDetails.date, uuid: faturaUuid, ...invoice };
    }

    async findInvoice(token: string, draftInvoice: DraftInvoice): Promise<InvoiceListItem | undefined> {
        const invoices = await this.getAllInvoicesByDateRange(token, {
            startDate: draftInvoice.date,
            endDate: draftInvoice.date,
        });
        return invoices.find((inv) => inv.ettn === draftInvoice.uuid);
    }

    async signDraftInvoice(token: string, draftInvoice: InvoiceListItem): Promise<ApiResponse> {
        return this.runCommand<ApiResponse>(token, ...COMMANDS.signDraftInvoice, {
            imzalanacaklar: [draftInvoice],
        });
    }

    async cancelDraftInvoice(token: string, reason: string, draftInvoice: InvoiceListItem): Promise<unknown> {
        const result = await this.runCommand<ApiResponse>(token, ...COMMANDS.cancelDraftInvoice, {
            silinecekler: [draftInvoice],
            aciklama: reason,
        });
        return result.data;
    }

    // ─── Queries ───────────────────────────────────────────────────────────────

    async getAllInvoicesByDateRange(token: string, { startDate, endDate }: DateRange): Promise<InvoiceListItem[]> {
        const result = await this.runCommand<ApiResponse<InvoiceListItem[]>>(
            token,
            ...COMMANDS.getAllInvoicesByDateRange,
            { baslangic: startDate, bitis: endDate, hangiTip: "5000/30000", table: [] },
        );
        return result.data;
    }

    async getAllInvoicesIssuedToMeByDateRange(
        token: string,
        { startDate, endDate }: DateRange,
    ): Promise<InvoiceListItem[]> {
        const result = await this.runCommand<ApiResponse<InvoiceListItem[]>>(
            token,
            ...COMMANDS.getAllInvoicesIssuedToMeByDateRange,
            { baslangic: startDate, bitis: endDate, hangiTip: "5000/30000", table: [] },
        );
        return result.data;
    }

    // ─── Download & HTML ───────────────────────────────────────────────────────

    async getInvoiceHTML(token: string, uuid: string, { signed }: SignedOptions): Promise<string> {
        const result = await this.runCommand<ApiResponse<string>>(token, ...COMMANDS.getInvoiceHTML, {
            ettn: uuid,
            onayDurumu: signed ? "Onaylandı" : "Onaylanmadı",
        });
        return result.data;
    }

    getDownloadURL(token: string, invoiceUUID: string, { signed }: SignedOptions): string {
        return (
            `${this.baseURL}/earsiv-services/download` +
            `?token=${token}&ettn=${invoiceUUID}&belgeTip=FATURA` +
            `&onayDurumu=${encodeURIComponent(signed ? "Onaylandı" : "Onaylanmadı")}` +
            `&cmd=downloadResource&`
        );
    }

    // ─── User ──────────────────────────────────────────────────────────────────

    async getUserData(token: string): Promise<UserData> {
        const result = await this.runCommand<ApiResponse<RawUserData>>(token, ...COMMANDS.getUserData);
        const d = result.data;
        return {
            taxIDOrTRID: d.vknTckn,
            title: d.unvan,
            name: d.ad,
            surname: d.soyad,
            registryNo: d.sicilNo,
            mersisNo: d.mersisNo,
            taxOffice: d.vergiDairesi,
            fullAddress: d.cadde,
            buildingName: d.apartmanAdi,
            buildingNumber: d.apartmanNo,
            doorNumber: d.kapiNo,
            town: d.kasaba,
            district: d.ilce,
            city: d.il,
            zipCode: d.postaKodu,
            country: d.ulke,
            phoneNumber: d.telNo,
            faxNumber: d.faksNo,
            email: d.ePostaAdresi,
            webSite: d.webSitesiAdresi,
            businessCenter: d.isMerkezi,
        };
    }

    async updateUserData(token: string, userData: UserData): Promise<unknown> {
        const result = await this.runCommand<ApiResponse>(token, ...COMMANDS.updateUserData, {
            vknTckn: userData.taxIDOrTRID,
            unvan: userData.title,
            ad: userData.name,
            soyad: userData.surname,
            sicilNo: userData.registryNo,
            mersisNo: userData.mersisNo,
            vergiDairesi: userData.taxOffice,
            cadde: userData.fullAddress,
            apartmanAdi: userData.buildingName,
            apartmanNo: userData.buildingNumber,
            kapiNo: userData.doorNumber,
            kasaba: userData.town,
            ilce: userData.district,
            il: userData.city,
            postaKodu: userData.zipCode,
            ulke: userData.country,
            telNo: userData.phoneNumber,
            faksNo: userData.faxNumber,
            ePostaAdresi: userData.email,
            webSitesiAdresi: userData.webSite,
            isMerkezi: userData.businessCenter,
        });
        return result.data;
    }

    // ─── Recipient ─────────────────────────────────────────────────────────────

    async getRecipientDataByTaxIDOrTRID(token: string, taxIDOrTRID: string): Promise<unknown> {
        const result = await this.runCommand<ApiResponse>(token, ...COMMANDS.getRecipientDataByTaxIDOrTRID, {
            vknTcknn: taxIDOrTRID,
        });
        return result.data;
    }

    // ─── SMS ───────────────────────────────────────────────────────────────────

    async sendSignSMSCode(token: string, phone: string): Promise<string | undefined> {
        const result = await this.runCommand<SmsResponse>(token, ...COMMANDS.sendSignSMSCode, {
            CEPTEL: phone,
            KCEPTEL: false,
            TIP: "",
        });
        return result.oid;
    }

    async verifySignSMSCode(token: string, smsCode: string, operationId: string): Promise<string | undefined> {
        const result = await this.runCommand<SmsResponse>(token, ...COMMANDS.verifySMSCode, {
            SIFRE: smsCode,
            OID: operationId,
        });
        return result.oid;
    }

    // ─── High-level composite ──────────────────────────────────────────────────

    async createInvoice(
        userId: string,
        password: string,
        invoiceDetails: InvoiceDetails,
        { sign = true }: CreateInvoiceOptions = {},
    ): Promise<CreateInvoiceResult> {
        const token = await this.getToken(userId, password);
        const draft = await this.createDraftInvoice(token, invoiceDetails);
        const details = await this.findInvoice(token, draft);
        if (sign && details !== undefined) {
            await this.signDraftInvoice(token, details);
        }
        return { token, uuid: draft.uuid, signed: sign };
    }

    async createInvoiceAndGetDownloadURL(
        userId: string,
        password: string,
        invoiceDetails: InvoiceDetails,
        options?: CreateInvoiceOptions,
    ): Promise<string> {
        const { token, uuid, signed } = await this.createInvoice(userId, password, invoiceDetails, options);
        return this.getDownloadURL(token, uuid, { signed });
    }

    async createInvoiceAndGetHTML(
        userId: string,
        password: string,
        invoiceDetails: InvoiceDetails,
        options?: CreateInvoiceOptions,
    ): Promise<string> {
        const { token, uuid, signed } = await this.createInvoice(userId, password, invoiceDetails, options);
        return this.getInvoiceHTML(token, uuid, { signed });
    }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createFaturaClient(env: EnvironmentKey = "PROD"): FaturaClient {
    return new FaturaClient(env);
}
