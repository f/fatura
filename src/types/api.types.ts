export type EnvironmentKey = "PROD" | "TEST";

export interface EnvConfig {
    BASE_URL: string;
}

export interface RequestOptions {
    credentials: string;
    headers: Record<string, string>;
    referrer: string;
    referrerPolicy: string;
    method: string;
    mode: string;
    body?: string;
}

export interface ApiResponse<T = unknown> {
    data: T;
    oid?: string;
    token?: string;
    /** GİB API hata kodu — "0" veya yoksa başarılı, "1" hata */
    error?: string;
    messages?: GibApiMessage[];
}

/**
 * GİB API mesaj alanı iki formatta gelebilir:
 *  - Nesne: { type: string; text: string }  (çoğu endpoint)
 *  - String: "Genel Sistem Hatası: ..."      (bazı dispatch hataları)
 */
export type GibApiMessage = string | { type: string; text: string };

/** getToken / logout endpoint'inden dönen ham response */
export interface GibAuthResponse {
    token?: string;
    /** login.html gibi bir redirect URL nesnesi veya string olabilir */
    data?: { redirectUrl: string } | string | unknown;
    error?: string;
    messages?: GibApiMessage[];
}

/**
 * `EARSIV_PORTAL_TASLAKLARI_GETIR` liste kaydı.
 *
 * Alan adları GİB portalının döndürdüğü gerçek anahtarlardır; tarih
 * `GG-AA-YYYY` biçiminde gelir (sorgu parametreleri ise `GG/AA/YYYY`).
 */
export interface InvoiceListItem {
    ettn: string;
    belgeNumarasi?: string;
    belgeTarihi?: string;
    aliciVknTckn?: string;
    aliciUnvanAdSoyad?: string;
    belgeTuru?: string;
    onayDurumu?: string;
    [key: string]: unknown;
}
