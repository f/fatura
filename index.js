const fetch = require("isomorphic-fetch");
const uuid = require("uuid/v1");
const numberToText = require("number-to-text");
require("number-to-text/converters/tr");

const ENV = {
  PROD: {
    BASE_URL: "https://earsivportal.efatura.gov.tr"
  },
  TEST: {
    BASE_URL: "https://earsivportaltest.efatura.gov.tr"
  }
};

let CURRENT_ENV = "PROD";

const COMMANDS = {
  createDraftInvoice: ["EARSIV_PORTAL_FATURA_OLUSTUR", "RG_BASITFATURA"],
  getAllInvoicesByDateRange: [
    "EARSIV_PORTAL_TASLAKLARI_GETIR",
    "RG_BASITTASLAKLAR"
  ],
  signDraftInvoice: [
    "EARSIV_PORTAL_FATURA_HSM_CIHAZI_ILE_IMZALA",
    "RG_BASITTASLAKLAR"
  ],
  getInvoiceHTML: ["EARSIV_PORTAL_FATURA_GOSTER", "RG_BASITTASLAKLAR"],
  cancelDraftInvoice: ["EARSIV_PORTAL_FATURA_SIL", "RG_BASITTASLAKLAR"],
  getRecipientDataByTaxIDOrTRID: [
    "SICIL_VEYA_MERNISTEN_BILGILERI_GETIR",
    "RG_BASITFATURA"
  ],
  sendSignSMSCode: ["EARSIV_PORTAL_SMSSIFRE_GONDER", "RG_SMSONAY"],
  verifySMSCode: ["EARSIV_PORTAL_SMSSIFRE_DOGRULA", "RG_SMSONAY"],
  getUserData: ["EARSIV_PORTAL_KULLANICI_BILGILERI_GETIR", "RG_KULLANICI"],
  updateUserData: ["EARSIV_PORTAL_KULLANICI_BILGILERI_KAYDET", "RG_KULLANICI"]
};

const DEFAULT_REQUEST_OPTS = () => ({
  credentials: "omit",
  headers: {
    accept: "*/*",
    "accept-language": "tr,en-US;q=0.9,en;q=0.8",
    "cache-control": "no-cache",
    "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
    pragma: "no-cache",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin"
  },
  referrer: `${ENV[CURRENT_ENV].BASE_URL}/intragiris.html`,
  referrerPolicy: "no-referrer-when-downgrade",
  method: "POST",
  mode: "cors"
});

// Utils:

function enableTestMode() {
  CURRENT_ENV = "TEST";
}

function convertNumber(number) {
  return numberToText.convertToText(number, {
    language: "tr",
    case: "upperCase"
  });
}

function convertPriceToText(price) {
  let [main, sub] = price.toFixed(2).split(".");
  if (sub === "00") sub = "0";
  return `${convertNumber(main)} LIRA ${convertNumber(sub)} KURUS`;
}

async function runCommand(token, command, pageName, data = {}) {
  const response = await fetch(
    `${ENV[CURRENT_ENV].BASE_URL}/earsiv-services/dispatch`,
    {
      ...DEFAULT_REQUEST_OPTS(),
      referrer: `${ENV[CURRENT_ENV].BASE_URL}/login.jsp`,
      body: `cmd=${command}&callid=${uuid()}&pageName=${pageName}&token=${token}&jp=${encodeURIComponent(
        JSON.stringify(data || {})
      )}`
    }
  );
  return response.json();
}

// Token Getter

async function getToken(userName, password) {
  const response = await fetch(
    `${ENV[CURRENT_ENV].BASE_URL}/earsiv-services/assos-login`,
    {
      ...DEFAULT_REQUEST_OPTS(),
      referrer: `${ENV[CURRENT_ENV].BASE_URL}/intragiris.html`,
      body: `assoscmd=${
        CURRENT_ENV === "PROD" ? "anologin" : "login"
      }&rtype=json&userid=${userName}&sifre=${password}&sifre2=${password}&parola=1&`
    }
  );
  const json = await response.json();
  return json.token;
}

// API

async function createDraftInvoice(token, invoiceDetails = {}) {
  const invoiceData = {
    faturaUuid: invoiceDetails.uuid || uuid(),
    belgeNumarasi: invoiceDetails.documentNumber || "",
    faturaTarihi: invoiceDetails.date,
    saat: invoiceDetails.time,
    paraBirimi: invoiceDetails.currency || "TRY",
    dovzTLkur: invoiceDetails.currencyRate || "0",
    faturaTipi: invoiceDetails.invoiceType || "SATIS",
    vknTckn: invoiceDetails.taxIDOrTRID || "11111111111",
    aliciUnvan: invoiceDetails.title || "",
    aliciAdi: invoiceDetails.name || "",
    aliciSoyadi: invoiceDetails.surname || "",
    binaAdi: invoiceDetails.buildingName || "",
    binaNo: invoiceDetails.buildingNumber || "",
    kapiNo: invoiceDetails.doorNumber || "",
    kasabaKoy: invoiceDetails.town || "",
    vergiDairesi: invoiceDetails.taxOffice || "",
    ulke: invoiceDetails.country,
    bulvarcaddesokak: invoiceDetails.fullAddress,
    mahalleSemtIlce: invoiceDetails.district,
    sehir: invoiceDetails.city || " ",
    postaKodu: invoiceDetails.zipCode || "",
    tel: invoiceDetails.phoneNumber,
    fax: invoiceDetails.faxNumber,
    eposta: invoiceDetails.email,
    websitesi: invoiceDetails.webSite,
    iadeTable: (invoiceDetails.returnItems || []).map(),
    ozelMatrahTutari: (invoiceDetails.specialTaxBaseAmount || 0).toFixed(2),
    ozelMatrahOrani: invoiceDetails.specialTaxBaseRate || "",
    ozelMatrahVergiTutari: (
      invoiceDetails.specialTaxBaseTaxAmount || 0
    ).toFixed(2),
    vergiCesidi: invoiceDetails.taxType || " ",
    malHizmetTable: invoiceDetails.items.map(item => ({
      malHizmet: item.name,
      miktar: item.quantity || 1,
      birim: item.unitType || "C62",
      birimFiyat: (item.unitPrice || 0).toFixed(2),
      fiyat: item.price.toFixed(2),
      iskontoOrani: item.discountRate || 0,
      iskontoTutari: (item.discountAmount || 0).toFixed(2) || "",
      iskontoNedeni: item.discountReason,
      malHizmetTutari: ((item.quantity || 0) * (item.unitPrice || 0)).toFixed(
        2
      ),
      kdvOrani: (item.VATRate || 0).toFixed(0),
      vergiOrani: item.taxRate || 0,
      kdvTutari: (item.VATAmount || 0).toFixed(2),
      vergininKdvTutari: (item.VATAmountOfTax || 0).toFixed(2)
    })),
    tip: "İskonto",
    matrah: invoiceDetails.grandTotal.toFixed(2),
    malhizmetToplamTutari: invoiceDetails.grandTotal.toFixed(2),
    toplamIskonto: (invoiceDetails.totalDiscount || 0).toFixed(2),
    hesaplanankdv: invoiceDetails.totalVAT.toFixed(2),
    vergilerToplami: invoiceDetails.totalVAT.toFixed(2),
    vergilerDahilToplamTutar: invoiceDetails.grandTotalInclVAT.toFixed(2),
    odenecekTutar: invoiceDetails.paymentTotal.toFixed(2),
    not: convertPriceToText(invoiceDetails.paymentTotal),
    siparisNumarasi: invoiceDetails.orderNumber || "",
    siparisTarihi: invoiceDetails.orderDate || "",
    irsaliyeNumarasi: invoiceDetails.dispatchNumber || "",
    irsaliyeTarihi: invoiceDetails.discountDate || "",
    fisNo: invoiceDetails.slipNumber || "",
    fisTarihi: invoiceDetails.slipDate || "",
    fisSaati: invoiceDetails.slipTime || " ",
    fisTipi: invoiceDetails.slipType || " ",
    zRaporNo: invoiceDetails.zReportNumber || "",
    okcSeriNo: invoiceDetails.okcSerialNumber || ""
  };

  const invoice = await runCommand(
    token,
    ...COMMANDS.createDraftInvoice,
    invoiceData
  );
  return {
    date: invoiceData.faturaTarihi,
    uuid: invoiceData.faturaUuid,
    ...invoice
  };
}

async function getAllInvoicesByDateRange(token, { startDate, endDate }) {
  const invoices = await runCommand(
    token,
    ...COMMANDS.getAllInvoicesByDateRange,
    {
      baslangic: startDate,
      bitis: endDate,
      table: []
    }
  );
  return invoices.data;
}

async function findInvoice(token, draftInvoice) {
  const { date, uuid } = draftInvoice;
  const invoices = await getAllInvoicesByDateRange(token, date, date);
  return invoices.data.find(invoice => invoice.ettn === uuid);
}

async function signDraftInvoice(token, draftInvoice) {
  return runCommand(token, ...COMMANDS.signDraftInvoice, {
    imzalanacaklar: [draftInvoice]
  });
}

async function getInvoiceHTML(token, uuid, { signed }) {
  const invoice = await runCommand(token, ...COMMANDS.getInvoiceHTML, {
    ettn: uuid,
    onayDurumu: signed ? "Onaylandı" : "Onaylanmadı"
  });
  return invoice.data;
}

function getDownloadURL(token, invoiceUUID, { signed }) {
  return `${
    ENV[CURRENT_ENV].BASE_URL
  }/earsiv-services/download?token=${token}&ettn=${invoiceUUID}&belgeTip=FATURA&onayDurumu=${encodeURIComponent(
    signed ? "Onaylandı" : "Onaylanmadı"
  )}&cmd=downloadResource&`;
}

async function cancelDraftInvoice(token, reason, draftInvoice) {
  const cancel = await runCommand(token, ...COMMANDS.cancelDraftInvoice, {
    silinecekler: [draftInvoice],
    aciklama: reason
  });
  return cancel.data;
}

async function getRecipientDataByTaxIDOrTRID(token, taxIDOrTRID) {
  const recipient = await runCommand(
    token,
    ...COMMANDS.getRecipientDataByTaxIDOrTRID,
    {
      vknTcknn: taxIDOrTRID
    }
  );
  return recipient.data;
}

async function getRecipientDataByTaxIDOrTRID(token, taxIDOrTRID) {
  const recipient = await runCommand(
    token,
    ...COMMANDS.getRecipientDataByTaxIDOrTRID,
    {
      vknTcknn: taxIDOrTRID
    }
  );
  return recipient.data;
}

async function sendSignSMSCode(token, phone) {
  const sms = await runCommand(token, ...COMMANDS.sendSignSMSCode, {
    CEPTEL: phone,
    KCEPTEL: false,
    TIP: ""
  });
  return sms.oid;
}

async function verifySignSMSCode(token, smsCode, operationId) {
  const sms = await runCommand(token, ...COMMANDS.verifySignSMSCode, {
    SIFRE: smsCode,
    OID: operationId
  });
  return sms.oid;
}

async function getUserData() {
  const user = await runCommand(token, ...COMMANDS.getUserData);
  return {
    taxIDOrTRID: user.vknTckn,
    title: user.unvan,
    name: user.ad,
    surname: user.soyad,
    registryNo: user.sicilNo,
    mersisNo: user.mersisNo,
    taxOffice: user.vergiDairesi,
    fullAddress: user.cadde,
    buildingName: user.apartmanAdi,
    buildingNumber: user.apartmanNo,
    doorNumber: user.kapiNo,
    town: user.kasaba,
    district: user.ilce,
    city: user.il,
    zipCode: user.postaKodu,
    country: user.ulke,
    phoneNumber: user.telNo,
    faxNumber: user.faksNo,
    email: user.ePostaAdresi,
    webSite: user.webSitesiAdresi,
    businessCenter: user.isMerkezi
  };
}

async function updateUserData(userData) {
  const user = await runCommand(token, ...COMMANDS.updateUserData, {
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
    isMerkezi: userData.businessCenter
  });
  return user.data;
}

// Automated Bulk Commands

async function createInvoice(
  userId,
  password,
  invoiceDetails,
  { sign = true } = {}
) {
  const token = await getToken(userId, password);
  const draftInvoice = await createDraftInvoice(token, invoiceDetails);
  const draftInvoiceDetails = await findInvoice(token, draftInvoice);
  if (sign) {
    await signDraftInvoice(token, draftInvoiceDetails);
  }
  return {
    token,
    uuid: draftInvoice.uuid,
    signed: sign
  };
}

async function createInvoiceAndGetDownloadURL(...args) {
  const { token, uuid, signed } = await createInvoice(...args);
  return getDownloadURL(token, uuid, signed);
}

async function createInvoiceAndGetHTML(...args) {
  const { token, uuid, signed } = await createInvoice(...args);
  return getInvoiceHTML(token, uuid, signed);
}

module.exports = {
  enableTestMode,
  getToken,
  createDraftInvoice,
  getAllInvoicesByDateRange,
  findInvoice,
  signDraftInvoice,
  getDownloadURL,
  getInvoiceHTML,
  createInvoiceAndGetHTML,
  createInvoiceAndGetDownloadURL,
  cancelDraftInvoice,
  getRecipientDataByTaxIDOrTRID,
  sendSignSMSCode,
  verifySignSMSCode,
  getUserData,
  updateUserData
};
