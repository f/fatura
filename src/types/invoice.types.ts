export interface InvoiceItem {
  name: string;
  quantity?: number;
  unitType?: string;
  unitPrice?: number;
  price: number;
  discountRate?: number;
  discountAmount?: number;
  discountReason?: string;
  discount?: string;
  VATRate?: number;
  VATAmount?: number;
  VATAmountOfTax?: number;
  taxRate?: number;
}

export interface InvoiceDetails {
  // Identity
  uuid?: string;
  documentNumber?: string;
  date: string;
  time: string;
  invoiceType?: string;
  hangiTip?: string;

  // Currency
  currency?: string;
  currencyRate?: string;

  // Order / dispatch / slip
  orderNumber?: string;
  orderDate?: string;
  dispatchNumber?: string;
  dispatchDate?: string;
  slipNumber?: string;
  slipDate?: string;
  slipTime?: string;
  slipType?: string;
  zReportNumber?: string;
  okcSerialNumber?: string;

  // Recipient
  taxIDOrTRID?: string;
  title?: string;
  name?: string;
  surname?: string;
  fullAddress?: string;
  buildingName?: string;
  buildingNumber?: string;
  doorNumber?: string;
  town?: string;
  district?: string;
  city?: string;
  country?: string;
  zipCode?: string;
  phoneNumber?: string;
  faxNumber?: string;
  email?: string;
  webSite?: string;
  taxOffice?: string;
  taxType?: string;

  // Commission / freight charges
  commissionRate?: number;
  freightRate?: number;
  hammaliyeOrani?: number;
  nakliyeOrani?: number;
  komisyonTutari?: string;
  navlunTutari?: string;
  hammaliyeTutari?: string;
  nakliyeTutari?: string;
  komisyonKDVOrani?: number;
  navlunKDVOrani?: number;
  hammaliyeKDVOrani?: number;
  nakliyeKDVOrani?: number;
  komisyonKDVTutari?: string;
  navlunKDVTutari?: string;
  hammaliyeKDVTutari?: string;
  nakliyeKDVTutari?: string;

  // Income / social security withholdings
  gelirVergisiOrani?: number;
  bagkurTevkifatiOrani?: number;
  gelirVergisiTevkifatiTutari?: string;
  bagkurTevkifatiTutari?: string;

  // Market / hall / defense fund fees
  halRusumuOrani?: number;
  halRusumuTutari?: string;
  halRusumuKDVOrani?: number;
  halRusumuKDVTutari?: string;
  ticaretBorsasiOrani?: number;
  ticaretBorsasiTutari?: string;
  ticaretBorsasiKDVOrani?: number;
  ticaretBorsasiKDVTutari?: string;
  milliSavunmaFonuOrani?: number;
  milliSavunmaFonuTutari?: string;
  milliSavunmaFonuKDVOrani?: number;
  milliSavunmaFonuKDVTutari?: string;
  digerOrani?: number;
  digerTutari?: string;
  digerKDVOrani?: number;
  digerKDVTutari?: string;

  // Special tax base
  specialTaxBaseAmount?: string;
  specialTaxBaseRate?: number;
  specialTaxBaseTaxAmount?: number;

  // Totals
  toplamMasraflar?: string;
  grandTotal: number;
  totalDiscount?: number;
  totalVAT: number;
  grandTotalInclVAT: number;
  paymentTotal: number;

  // Items
  items: InvoiceItem[];
  returnItems?: unknown[];
}

export interface DraftInvoice {
  date: string;
  uuid: string;
  [key: string]: unknown;
}

export interface CreateInvoiceResult {
  token: string;
  uuid: string;
  signed: boolean;
}
