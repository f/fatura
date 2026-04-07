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
}

export interface InvoiceListItem {
  ettn: string;
  faturaTarihi: string;
  aliciUnvan?: string;
  aliciAdi?: string;
  aliciSoyadi?: string;
  belgeTuru?: string;
  onayDurumu?: string;
  [key: string]: unknown;
}
