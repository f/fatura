# 🧾 Fatura.js

eArşiv sistemi üzerinde fatura oluşturmanızı sağlar.

### Alternatifler

| Dil | Repo                                                | Geliştirici     |
| --- | --------------------------------------------------- | --------------- |
| PHP | https://github.com/AdemAliDurmus/fatura             | Adem Ali Durmuş |
| PHP | https://github.com/furkankadioglu/efatura           | Furkan Kadıoğlu |
| PHP | https://github.com/mlevent/fatura                   | Mert Levent     |
| C#  | https://github.com/BFYDigital/e-arsiv-fatura-dotnet | BFY Digital     |

> Bu sistem **https://earsivportal.efatura.gov.tr/** adresini kullanarak bu sistem üzerinden fatura oluşturmanızı sağlar.

> Bu sistem GİB'e tabi **şahıs şirketi** ya da **şirket** hesapları ile çalışır ve bu kişilikler adına resmi fatura oluşturur. Kesilen faturaları https://earsivportal.efatura.gov.tr/ adresinden görüntüleyebilir ya da bu kütüphane ile indirebilirsiniz.

#### Kullanıcı Adı ve Parola Bilgileri

> [https://earsivportal.efatura.gov.tr/intragiris.html](https://earsivportal.efatura.gov.tr/intragiris.html) adresindeki parola ekranında kullanılan kullanıcı kodu ve parola ile bu paketi kullanabilirsiniz.
> ℹ️ Bu **kullanıcı kodu ve parola bilgilerini** muhasebecinizden ya da **GİB - İnteraktif Vergi Dairesi**'nden edinebilirsiniz.

## Yükleme

```
npm install fatura
```

**Node.js 18 veya üzeri** gereklidir (`package.json` içinde `engines`).

## Kullanım

Tüm işlemler bir **`FaturaClient`** örneği üzerinden yapılır. Üretim (canlı GİB) için:

```js
const { createFaturaClient } = require("fatura");
const client = createFaturaClient(); // varsayılan: PROD
```

**Test ortamı** (`https://earsivportaltest.efatura.gov.tr`):

```js
const client = createFaturaClient("TEST");
```

ES modülü:

```js
import { createFaturaClient } from "fatura";
const client = createFaturaClient();
```

Oldukça kolay bir kullanıma sahiptir:

#### `createInvoiceAndGetDownloadURL(user, pass, invoice, { sign })`

Bu method ile fatura oluşturulup imzalanır ve indirme adresi döner.

```js
const { createFaturaClient } = require("fatura");

const client = createFaturaClient();

const faturaURL = await client.createInvoiceAndGetDownloadURL(
    "GIB Kullanıcı Adı",
    "GIB Parolası",
    {
        ...faturaDetayları,
    },
    // Varsayılan olarak sign: true gönderilir.
    { sign: false },
);
```

#### `createInvoiceAndGetHTML(user, pass, invoice, { sign })`

Bu method ile fatura oluşturulup imzalanır ve fatura HTML'i döner. Bu HTML'i `iframe` içerisinde gösterip yazdırılmasını sağlayabilirsiniz.

```js
const { createFaturaClient } = require("fatura");

const client = createFaturaClient();

const faturaHTML = await client.createInvoiceAndGetHTML(
    "GIB Kullanıcı Adı",
    "GIB Parolası",
    {
        ...faturaDetayları,
    },
    // Varsayılan olarak sign: true gönderilir.
    { sign: false },
);
```

---

## Diğer metodlar (`client` üzerinde)

Aşağıdakilerin tümü **`const client = createFaturaClient(...)`** ile oluşturduğunuz istemci üzerinde çağrılır.

#### `getToken(user, pass)`

**e-Arşiv Portal** oturumu için `token` döner.

#### `createDraftInvoice(token, invoiceDetails)`

e-Arşiv’de önce **taslak** oluşturulur. Dönüş değerinde `uuid`, `date` ve GİB cevabı bulunur. `invoiceDetails` örnek şekli:

> ℹ️ `uuid` vermezseniz yeni bir UUID atanır.

```js
{
    uuid: "4c72cb57-b72d-4812-ac48-0a0bce83e771",

    date: "08/02/2020",
    time: "09:07:48",
    taxIDOrTRID: "11111111111",
    taxOffice: "Beylikduzu",
    title: "FATIH AKIN",
    name: "",
    surname: "",
    fullAddress: "X Sok. Y Cad. No: 3 Z Istanbul",
    items: [
        {
            name: "Stickker",
            quantity: 1,
            unitPrice: 100,
            price: 100,
            VATRate: 20,
            VATAmount: 20,
        },
    ],
    totalVAT: 20,
    grandTotal: 100.0,
    grandTotalInclVAT: 120.0,
    paymentTotal: 120.0,
}
```

#### `findInvoice(token, draftInvoice)`

`createDraftInvoice`’ın döndürdüğü **taslak nesnesi** (`date` + `uuid` içeren) verilir; ilgili gündeki taslaklar arasından eşleşen kayıt döner. **İmzalama** için gereken bilgiler (ör. belge numarası) bu nesnede yer alır.

#### `getAllInvoicesByDateRange(token, { startDate, endDate })`

İki tarih arasındaki **kesilen / taslak** listesi (GİB komutuna göre).

#### `getAllInvoicesIssuedToMeByDateRange(token, { startDate, endDate })`

İki tarih arasındaki **adıma düzenlenen** belgeler.

#### `signDraftInvoice(token, draftInvoice)`

☢️ İmzalama **kesilmiş sayılan mali işlem** oluşturur; dikkatli kullanın.

`findInvoice` ile bulunan **liste öğesi** (`draftInvoice` formatı) verilmelidir.

#### `getDownloadURL(token, invoiceUUID, { signed })`

İndirme URL’si döner (`.zip` içinde HTML/XML olabilir). **`signed`**: fatura onaylı mı (`true` / `false`).

#### `getInvoiceHTML(token, uuid, { signed })`

Fatura HTML metni. **`signed`** imzalı/onaysız görünüm için kullanılır.

#### `cancelDraftInvoice(token, reason, draftInvoice)`

Taslak iptali.

#### `getRecipientDataByTaxIDOrTRID(token, taxIDOrTRID)`

VKN/TCKN ile alıcı bilgisi sorgusu.

#### `sendSignSMSCode` / `verifySignSMSCode`

İmzaya ilişkin SMS doğrulama akışı (GİB kurallarına tabi).

#### `getUserData` / `updateUserData`

Portal kullanıcı bilgilerini okuma / güncelleme.

#### `createInvoice(user, pass, invoiceDetails, { sign })`

Token alır, taslak oluşturur, bulur; `sign: true` (varsayılan) ise imzalar. `findInvoice` sonuç vermezse imza atlanır.

#### `logout(token)`

Oturum kapatma; GİB cevabına göre dönüş tipi değişebilir.

## Lisans

MIT

---

> ☢️ **BU PAKET VERGİYE TABİ OLAN MALİ VERİ OLUŞTURUR.** BU PAKET NEDENİYLE OLUŞABİLECEK SORUNLARDAN BU PAKET SORUMLU TUTULAMAZ, RİSK KULLANANA AİTTİR. RİSKLİ GÖRÜYORSANIZ KULLANMAYINIZ.
