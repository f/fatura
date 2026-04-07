"use client";

import {
    createFaturaClient,
    type ApiResponse,
    type CreateInvoiceResult,
    type DraftInvoice,
    type EnvironmentKey,
    type InvoiceDetails,
    type InvoiceListItem,
    type UserData,
} from "fatura";

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

const ALLOWED_HOSTS = new Set(["earsivportal.efatura.gov.tr", "earsivportaltest.efatura.gov.tr"]);

function isGibRequest(target: string): boolean {
    try {
        const parsed = new URL(target);
        return parsed.protocol === "https:" && ALLOWED_HOSTS.has(parsed.hostname);
    } catch {
        return false;
    }
}

function headersToObject(headers?: HeadersInit): Record<string, string> {
    if (!headers) {
        return {};
    }

    const normalized = new Headers(headers);
    const output: Record<string, string> = {};

    normalized.forEach((value, key) => {
        output[key] = value;
    });

    return output;
}

function bodyToString(body: BodyInit | null | undefined): string | undefined {
    if (!body) {
        return undefined;
    }

    if (typeof body === "string") {
        return body;
    }

    if (body instanceof URLSearchParams) {
        return body.toString();
    }

    return undefined;
}

export class BrowserFaturaClient {
    private readonly client: ReturnType<typeof createFaturaClient>;

    constructor(env: EnvironmentKey = "PROD") {
        this.client = createFaturaClient(env);
    }

    private async runWithProxy<T>(action: () => Promise<T>): Promise<T> {
        if (typeof window === "undefined") {
            throw new Error("BrowserFaturaClient yalnızca tarayıcı ortamında çalışır.");
        }

        const originalFetch = window.fetch.bind(window);

        window.fetch = (async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
            const targetURL = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

            if (!isGibRequest(targetURL)) {
                return originalFetch(input, init);
            }

            const method =
                init?.method ?? (typeof input !== "string" && !(input instanceof URL) ? input.method : "GET");

            const headers =
                init?.headers ?? (typeof input !== "string" && !(input instanceof URL) ? input.headers : undefined);

            const bodySource =
                init?.body ??
                (typeof input !== "string" && !(input instanceof URL) ? await input.clone().text() : undefined);

            const body = typeof bodySource === "string" ? bodySource : bodyToString(bodySource as BodyInit | undefined);

            return originalFetch("/api/gib-proxy", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    url: targetURL,
                    method,
                    headers: headersToObject(headers),
                    body,
                }),
            });
        }) as typeof window.fetch;

        try {
            return await action();
        } finally {
            window.fetch = originalFetch;
        }
    }

    async getToken(userName: string, password: string): Promise<string> {
        return this.runWithProxy(() => this.client.getToken(userName, password));
    }

    async logout(token: string): Promise<unknown> {
        return this.runWithProxy(() => this.client.logout(token));
    }

    async createDraftInvoice(token: string, invoiceDetails: InvoiceDetails): Promise<DraftInvoice> {
        return this.runWithProxy(() => this.client.createDraftInvoice(token, invoiceDetails));
    }

    async findInvoice(token: string, draftInvoice: DraftInvoice): Promise<InvoiceListItem | undefined> {
        return this.runWithProxy(() => this.client.findInvoice(token, draftInvoice));
    }

    async signDraftInvoice(token: string, draftInvoice: InvoiceListItem): Promise<ApiResponse> {
        return this.runWithProxy(() => this.client.signDraftInvoice(token, draftInvoice));
    }

    async cancelDraftInvoice(token: string, reason: string, draftInvoice: InvoiceListItem): Promise<unknown> {
        return this.runWithProxy(() => this.client.cancelDraftInvoice(token, reason, draftInvoice));
    }

    async getAllInvoicesByDateRange(token: string, range: DateRange): Promise<InvoiceListItem[]> {
        return this.runWithProxy(() => this.client.getAllInvoicesByDateRange(token, range));
    }

    async getAllInvoicesIssuedToMeByDateRange(token: string, range: DateRange): Promise<InvoiceListItem[]> {
        return this.runWithProxy(() => this.client.getAllInvoicesIssuedToMeByDateRange(token, range));
    }

    async getInvoiceHTML(token: string, uuid: string, options: SignedOptions): Promise<string> {
        return this.runWithProxy(() => this.client.getInvoiceHTML(token, uuid, options));
    }

    getDownloadURL(token: string, invoiceUUID: string, options: SignedOptions): string {
        return this.client.getDownloadURL(token, invoiceUUID, options);
    }

    async getUserData(token: string): Promise<UserData> {
        return this.runWithProxy(() => this.client.getUserData(token));
    }

    async updateUserData(token: string, userData: UserData): Promise<unknown> {
        return this.runWithProxy(() => this.client.updateUserData(token, userData));
    }

    async getRecipientDataByTaxIDOrTRID(token: string, taxIDOrTRID: string): Promise<unknown> {
        return this.runWithProxy(() => this.client.getRecipientDataByTaxIDOrTRID(token, taxIDOrTRID));
    }

    async sendSignSMSCode(token: string, phone: string): Promise<string | undefined> {
        return this.runWithProxy(() => this.client.sendSignSMSCode(token, phone));
    }

    async verifySignSMSCode(token: string, smsCode: string, operationId: string): Promise<string | undefined> {
        return this.runWithProxy(() => this.client.verifySignSMSCode(token, smsCode, operationId));
    }

    async createInvoice(
        userId: string,
        password: string,
        invoiceDetails: InvoiceDetails,
        options?: CreateInvoiceOptions,
    ): Promise<CreateInvoiceResult> {
        return this.runWithProxy(() => this.client.createInvoice(userId, password, invoiceDetails, options));
    }

    async createInvoiceAndGetDownloadURL(
        userId: string,
        password: string,
        invoiceDetails: InvoiceDetails,
        options?: CreateInvoiceOptions,
    ): Promise<string> {
        return this.runWithProxy(() =>
            this.client.createInvoiceAndGetDownloadURL(userId, password, invoiceDetails, options),
        );
    }

    async createInvoiceAndGetHTML(
        userId: string,
        password: string,
        invoiceDetails: InvoiceDetails,
        options?: CreateInvoiceOptions,
    ): Promise<string> {
        return this.runWithProxy(() => this.client.createInvoiceAndGetHTML(userId, password, invoiceDetails, options));
    }
}

export function createBrowserFaturaClient(env: EnvironmentKey = "PROD") {
    return new BrowserFaturaClient(env);
}
