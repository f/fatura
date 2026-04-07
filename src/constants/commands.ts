export const COMMANDS = {
  createDraftInvoice:                 ["EARSIV_PORTAL_FATURA_OLUSTUR",                    "RG_BASITFATURA"],
  getAllInvoicesByDateRange:           ["EARSIV_PORTAL_TASLAKLARI_GETIR",                  "RG_BASITTASLAKLAR"],
  getAllInvoicesIssuedToMeByDateRange: ["EARSIV_PORTAL_ADIMA_KESILEN_BELGELERI_GETIR",     "RG_ALICI_TASLAKLAR"],
  signDraftInvoice:                   ["EARSIV_PORTAL_FATURA_HSM_CIHAZI_ILE_IMZALA",      "RG_BASITTASLAKLAR"],
  getInvoiceHTML:                     ["EARSIV_PORTAL_FATURA_GOSTER",                     "RG_BASITTASLAKLAR"],
  cancelDraftInvoice:                 ["EARSIV_PORTAL_FATURA_SIL",                        "RG_BASITTASLAKLAR"],
  getRecipientDataByTaxIDOrTRID:      ["SICIL_VEYA_MERNISTEN_BILGILERI_GETIR",            "RG_BASITFATURA"],
  sendSignSMSCode:                    ["EARSIV_PORTAL_SMSSIFRE_GONDER",                   "RG_SMSONAY"],
  verifySMSCode:                      ["EARSIV_PORTAL_SMSSIFRE_DOGRULA",                  "RG_SMSONAY"],
  getUserData:                        ["EARSIV_PORTAL_KULLANICI_BILGILERI_GETIR",          "RG_KULLANICI"],
  updateUserData:                     ["EARSIV_PORTAL_KULLANICI_BILGILERI_KAYDET",         "RG_KULLANICI"],
} as const;

export type CommandKey = keyof typeof COMMANDS;
export type CommandTuple = readonly [string, string];
