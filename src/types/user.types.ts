export interface UserData {
    taxIDOrTRID: string;
    title: string;
    name: string;
    surname: string;
    registryNo?: string;
    mersisNo?: string;
    taxOffice?: string;
    fullAddress?: string;
    buildingName?: string;
    buildingNumber?: string;
    doorNumber?: string;
    town?: string;
    district?: string;
    city?: string;
    zipCode?: string;
    country?: string;
    phoneNumber?: string;
    faxNumber?: string;
    email?: string;
    webSite?: string;
    businessCenter?: string;
}

export interface RawUserData {
    vknTckn: string;
    unvan: string;
    ad: string;
    soyad: string;
    sicilNo?: string;
    mersisNo?: string;
    vergiDairesi?: string;
    cadde?: string;
    apartmanAdi?: string;
    apartmanNo?: string;
    kapiNo?: string;
    kasaba?: string;
    ilce?: string;
    il?: string;
    postaKodu?: string;
    ulke?: string;
    telNo?: string;
    faksNo?: string;
    ePostaAdresi?: string;
    webSitesiAdresi?: string;
    isMerkezi?: string;
}
