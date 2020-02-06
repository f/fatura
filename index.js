const fetch = require("isomorphic-fetch");
const uuid = require("uuid/v1");
const numberToText = require("number-to-text");
require("number-to-text/converters/tr");

const BASE_URL = "https://earsivportal.efatura.gov.tr";

const COMMANDS = {
  createDraftInvoice: ["EARSIV_PORTAL_FATURA_OLUSTUR", "RG_BASITFATURA"],
  findDraftInvoice: ["EARSIV_PORTAL_TASLAKLARI_GETIR", "RG_BASITTASLAKLAR"],
  signDraftInvoice: [
    "EARSIV_PORTAL_FATURA_HSM_CIHAZI_ILE_IMZALA",
    "RG_BASITTASLAKLAR"
  ]
};

const DEFAULT_REQUEST_OPTS = {
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
  referrer: `${BASE_URL}/intragiris.html`,
  referrerPolicy: "no-referrer-when-downgrade",
  method: "POST",
  mode: "cors"
};

// Utils:

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

async function runCommand(token, command, pageName, data) {
  const response = await fetch(`${BASE_URL}/earsiv-services/dispatch`, {
    ...DEFAULT_REQUEST_OPTS,
    referrer: `${BASE_URL}/login.jsp`,
    body: `cmd=${command}&callid=${uuid()}&pageName=${pageName}&token=${token}&jp=${encodeURIComponent(
      JSON.stringify(data)
    )}`
  });
  return response.json();
}

// Token Getter

async function getToken(userName, password) {
  const response = await fetch(`${BASE_URL}/earsiv-services/assos-login`, {
    ...DEFAULT_REQUEST_OPTS,
    referrer: `${BASE_URL}/intragiris.html`,
    body: `assoscmd=anologin&rtype=json&userid=${userName}&sifre=${password}&sifre2=${password}&parola=1&`
  });
  const json = await response.json();
  return json.token;
}

// API

async function createDraftInvoice(token, invoiceDetails = {}) {
  const invoiceData = {
    faturaUuid: uuid(),
    belgeNumarasi: "",
    faturaTarihi: invoiceDetails.date,
    saat: invoiceDetails.time,
    paraBirimi: "TRY",
    dovzTLkur: "0",
    faturaTipi: "SATIS",
    vknTckn: invoiceDetails.taxIDOrTRID || "11111111111",
    aliciUnvan: invoiceDetails.title || "",
    aliciAdi: invoiceDetails.name,
    aliciSoyadi: invoiceDetails.surname,
    binaAdi: "",
    binaNo: "",
    kapiNo: "",
    kasabaKoy: "",
    vergiDairesi: invoiceDetails.taxOffice,
    ulke: "Türkiye",
    bulvarcaddesokak: invoiceDetails.fullAddress,
    mahalleSemtIlce: "",
    sehir: " ",
    postaKodu: "",
    tel: "",
    fax: "",
    eposta: "",
    websitesi: "",
    iadeTable: [],
    ozelMatrahTutari: "0",
    ozelMatrahOrani: 0,
    ozelMatrahVergiTutari: "0",
    vergiCesidi: " ",
    malHizmetTable: invoiceDetails.items.map(item => ({
      malHizmet: item.name,
      miktar: item.quantity || 1,
      birim: "C62",
      birimFiyat: item.unitPrice.toFixed(2),
      fiyat: item.price.toFixed(2),
      iskontoOrani: 0,
      iskontoTutari: "0",
      iskontoNedeni: "",
      malHizmetTutari: (item.quantity * item.unitPrice).toFixed(2),
      kdvOrani: item.VATRate.toFixed(0),
      vergiOrani: 0,
      kdvTutari: item.VATAmount.toFixed(2),
      vergininKdvTutari: "0"
    })),
    tip: "İskonto",
    matrah: invoiceDetails.grandTotal.toFixed(2),
    malhizmetToplamTutari: invoiceDetails.grandTotal.toFixed(2),
    toplamIskonto: "0",
    hesaplanankdv: invoiceDetails.totalVAT.toFixed(2),
    vergilerToplami: invoiceDetails.totalVAT.toFixed(2),
    vergilerDahilToplamTutar: invoiceDetails.grandTotalInclVAT.toFixed(2),
    odenecekTutar: invoiceDetails.paymentTotal.toFixed(2),
    not: convertPriceToText(invoiceDetails.paymentTotal),
    siparisNumarasi: "",
    siparisTarihi: "",
    irsaliyeNumarasi: "",
    irsaliyeTarihi: "",
    fisNo: "",
    fisTarihi: "",
    fisSaati: " ",
    fisTipi: " ",
    zRaporNo: "",
    okcSeriNo: ""
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

async function findDraftInvoice(token, draftInvoice) {
  const drafts = await runCommand(token, ...COMMANDS.findDraftInvoice, {
    baslangic: draftInvoice.date,
    bitis: draftInvoice.date,
    table: []
  });
  return drafts.data.find(invoice => invoice.ettn === draftInvoice.uuid);
}

async function signDraftInvoice(token, draftInvoice) {
  return runCommand(token, ...COMMANDS.signDraftInvoice, {
    imzalanacaklar: [draftInvoice]
  });
}

function getDownloadURL(token, invoiceUUID) {
  return `${BASE_URL}/earsiv-services/download?token=${token}&ettn=${invoiceUUID}&belgeTip=FATURA&onayDurumu=Onayland%C4%B1&cmd=downloadResource&`;
}

async function createInvoiceAndGetDownloadURL(
  userId,
  password,
  invoiceDetails
) {
  const token = await getToken(userId, password);
  const draftInvoice = await createDraftInvoice(token, invoiceDetails);
  const draftInvoiceDetails = await findDraftInvoice(token, draftInvoice);
  await signDraftInvoice(token, draftInvoiceDetails);
  const download = getDownloadURL(token, draftInvoice.uuid);
  return download;
}

module.exports = {
  getToken,
  createDraftInvoice,
  findDraftInvoice,
  signDraftInvoice,
  getDownloadURL,
  createInvoiceAndGetDownloadURL
};
