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
  getAllInvoicesIssuedToMeByDateRange: [
    "EARSIV_PORTAL_ADIMA_KESILEN_BELGELERI_GETIR",
    "RG_ALICI_TASLAKLAR"
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

  // TODO:
  // createProducerReceipt: ['EARSIV_PORTAL_MUSTAHSIL_OLUSTUR', 'RG_MUSTAHSIL'],
  // createSelfEmployedInvoice: ['EARSIV_PORTAL_SERBEST_MESLEK_MAKBUZU_OLUSTUR', 'RG_SERBEST'],
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

// Logout

async function logout(token) {
  const response = await fetch(`${ENV[CURRENT_ENV].BASE_URL}/earsiv-services/assos-login`, {
    ...DEFAULT_REQUEST_OPTS(),
    referrer: `${ENV[CURRENT_ENV].BASE_URL}/intragiris.html`,
    body: `assoscmd=${CURRENT_ENV === 'PROD' ? 'anologin' : 'logout'}&rtype=json&token=${token}&`,
  });
  const json = await response.json();
  return json.data; // send redirect url
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
    faturaTipi: invoiceDetails.invoiceType || "5000/30000",
    hangiTip: invoiceDetails.hangiTip || "Buyuk",
    siparisNumarasi: invoiceDetails.orderNumber || "",
    siparisTarihi: invoiceDetails.orderDate || "",
    irsaliyeNumarasi: invoiceDetails.dispatchNumber || "",
    irsaliyeTarihi: invoiceDetails.discountDate || "",
    fisNo: invoiceDetails.slipNumber || "",
    fisTarihi: invoiceDetails.slipDate || "",
    fisSaati: invoiceDetails.slipTime || " ",
    fisTipi: invoiceDetails.slipType || " ",
    zRaporNo: invoiceDetails.zReportNumber || "",
    okcSeriNo: invoiceDetails.okcSerialNumber || "",
    vknTckn: invoiceDetails.taxIDOrTRID || "11111111111",
    aliciUnvan: invoiceDetails.title || "",
    aliciAdi: invoiceDetails.name || "",
    aliciSoyadi: invoiceDetails.surname || "",
    bulvarcaddesokak: invoiceDetails.fullAddress,
    binaAdi: invoiceDetails.buildingName || "",
    binaNo: invoiceDetails.buildingNumber || "",
    kapiNo: invoiceDetails.doorNumber || "",
    kasabaKoy: invoiceDetails.town || "",
    mahalleSemtIlce: invoiceDetails.district || "",
    sehir: invoiceDetails.city || " ",
    ulke: invoiceDetails.country,
    postaKodu: invoiceDetails.zipCode || "",
    tel: invoiceDetails.phoneNumber || "",
    fax: invoiceDetails.faxNumber || "",
    eposta: invoiceDetails.email || "",
    websitesi: invoiceDetails.webSite || "",
    vergiDairesi: invoiceDetails.taxOffice || "",
    komisyonOrani: invoiceDetails.commissionRate || 0,
    navlunOrani: invoiceDetails.freightRate || 0,
    hammaliyeOrani: invoiceDetails.hammaliyeOrani || 0,
    nakliyeOrani: invoiceDetails.nakliyeOrani || 0,
    komisyonTutari: invoiceDetails.komisyonTutari || "0",
    navlunTutari: invoiceDetails.navlunTutari || "0",
    hammaliyeTutari: invoiceDetails.hammaliyeTutari || "0",
    nakliyeTutari: invoiceDetails.nakliyeTutari || "0",
    komisyonKDVOrani: invoiceDetails.komisyonKDVOrani || 0,
    navlunKDVOrani: invoiceDetails.navlunKDVOrani || 0,
    hammaliyeKDVOrani: invoiceDetails.hammaliyeKDVOrani || 0,
    nakliyeKDVOrani: invoiceDetails.nakliyeKDVOrani || 0,
    komisyonKDVTutari: invoiceDetails.komisyonKDVTutari || "0",
    navlunKDVTutari: invoiceDetails.navlunKDVTutari || "0",
    hammaliyeKDVTutari: invoiceDetails.hammaliyeKDVTutari || "0",
    nakliyeKDVTutari: invoiceDetails.nakliyeKDVTutari || "0",
    gelirVergisiOrani: invoiceDetails.gelirVergisiOrani || 0,
    bagkurTevkifatiOrani: invoiceDetails.bagkurTevkifatiOrani || 0,
    gelirVergisiTevkifatiTutari: invoiceDetails.gelirVergisiTevkifatiTutari || "0",
    bagkurTevkifatiTutari: invoiceDetails.bagkurTevkifatiTutari || "0",
    halRusumuOrani: invoiceDetails.halRusumuOrani || 0,
    ticaretBorsasiOrani: invoiceDetails.ticaretBorsasiOrani || 0,
    milliSavunmaFonuOrani: invoiceDetails.milliSavunmaFonuOrani || 0,
    digerOrani: invoiceDetails.digerOrani || 0,
    halRusumuTutari: invoiceDetails.hammaliyeTutari || "0",
    ticaretBorsasiTutari: invoiceDetails.ticaretBorsasiTutari || "0",
    milliSavunmaFonuTutari: invoiceDetails.milliSavunmaFonuTutari || "0",
    digerTutari: invoiceDetails.digerTutari || "0",
    halRusumuKDVOrani: invoiceDetails.halRusumuKDVOrani || 0,
    ticaretBorsasiKDVOrani: invoiceDetails.ticaretBorsasiKDVOrani || 0,
    milliSavunmaFonuKDVOrani: invoiceDetails.milliSavunmaFonuKDVOrani || 0,
    digerKDVOrani: invoiceDetails.digerKDVOrani || 0,
    halRusumuKDVTutari: invoiceDetails.halRusumuKDVTutari || "0",
    ticaretBorsasiKDVTutari: invoiceDetails.ticaretBorsasiKDVTutari || "0",
    milliSavunmaFonuKDVTutari: invoiceDetails.milliSavunmaFonuKDVTutari || "0",
    digerKDVTutari: invoiceDetails.digerKDVTutari || "0", 
    iadeTable: (invoiceDetails.returnItems || []).map(item => ({})),
    ozelMatrahTutari: (invoiceDetails.specialTaxBaseAmount || "0"),
    ozelMatrahOrani: invoiceDetails.specialTaxBaseRate || 0,
    ozelMatrahVergiTutari: (
      invoiceDetails.specialTaxBaseTaxAmount || 0
    ).toFixed(2).toString(),
    vergiCesidi: invoiceDetails.taxType || " ",
    malHizmetTable: invoiceDetails.items.map(item => ({
      iskontoArttm: item.discount || "İskonto",
      malHizmet: item.name,
      miktar: item.quantity || 1,
      birim: item.unitType || "C62",
      birimFiyat: (item.unitPrice || 0).toFixed(2).toString(),
      fiyat: item.price.toFixed(2).toString(),
      iskontoOrani: item.discountRate || 0,
      iskontoTutari: (item.discountAmount || 0).toFixed(2).toString() || "",
      iskontoNedeni: item.discountReason || "",
      malHizmetTutari: ((item.quantity || 0) * (item.unitPrice || 0)).toFixed(
        2
      ).toString(),
      kdvOrani: (item.VATRate || 0).toFixed(0).toString(),
      vergiOrani: item.taxRate || 0,
      kdvTutari: (item.VATAmount || 0).toFixed(2).toString(),
      vergininKdvTutari: (item.VATAmountOfTax || 0).toFixed(2).toString()
    })),
    tip: "İskonto",
    matrah: invoiceDetails.grandTotal.toFixed(2).toString(),
    malhizmetToplamTutari: invoiceDetails.grandTotal.toFixed(2).toString(),
    toplamIskonto: (invoiceDetails.totalDiscount || 0).toFixed(2).toString(),
    hesaplanankdv: invoiceDetails.totalVAT.toFixed(2).toString(),
    vergilerToplami: invoiceDetails.totalVAT.toFixed(2).toString(),
    vergilerDahilToplamTutar: invoiceDetails.grandTotalInclVAT.toFixed(2).toString(),
    toplamMasraflar: invoiceDetails.toplamMasraflar || "0",
    odenecekTutar: invoiceDetails.paymentTotal.toFixed(2).toString(),
    not: convertPriceToText(invoiceDetails.paymentTotal)
 
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
      hangiTip:"5000/30000",
      table: []
    }
  );
  return invoices.data;
}

async function getAllInvoicesIssuedToMeByDateRange(token, { startDate, endDate }) {
  const invoices = await runCommand(
    token,
    ...COMMANDS.getAllInvoicesIssuedToMeByDateRange,
    {
      baslangic: startDate,
      bitis: endDate,
      hangiTip:"5000/30000",
      table: []
    }
  );
  return invoices.data;
}

async function findInvoice(token, draftInvoice) {
  const { date, uuid } = draftInvoice;
  const invoices = await getAllInvoicesByDateRange(token, { startDate: date, endDate: date });
  return invoices.find(invoice => invoice.ettn === uuid);
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
  )}&cmd=EARSIV_PORTAL_BELGE_INDIR&`;
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

async function getUserData(token) {
  const user = await runCommand(token, ...COMMANDS.getUserData);
  return {
    taxIDOrTRID: user.data.vknTckn,
    title: user.data.unvan,
    name: user.data.ad,
    surname: user.data.soyad,
    registryNo: user.data.sicilNo,
    mersisNo: user.data.mersisNo,
    taxOffice: user.data.vergiDairesi,
    fullAddress: user.data.cadde,
    buildingName: user.data.apartmanAdi,
    buildingNumber: user.data.apartmanNo,
    doorNumber: user.data.kapiNo,
    town: user.data.kasaba,
    district: user.data.ilce,
    city: user.data.il,
    zipCode: user.data.postaKodu,
    country: user.data.ulke,
    phoneNumber: user.data.telNo,
    faxNumber: user.data.faksNo,
    email: user.data.ePostaAdresi,
    webSite: user.data.webSitesiAdresi,
    businessCenter: user.data.isMerkezi
  };
}

async function updateUserData(token, userData) {
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
  logout,
  createDraftInvoice,
  getAllInvoicesByDateRange,
  getAllInvoicesIssuedToMeByDateRange,
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
