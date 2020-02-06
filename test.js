const { createInvoiceAndGetDownloadURL } = require("./index");

async function main() {
  await createInvoiceAndGetDownloadURL("<GIB Kodu>", "<GIB Parola>", {
    date: "08/02/2020",
    time: "09:07:48",
    taxIDOrTRID: "11111111111",
    taxOffice: "Beylikduzu",
    title: "FATIH AKIN",
    name: "",
    surname: "",
    fullAddress: "X Sok. Y Cad. No: 3 Z T",
    items: [
      {
        name: "Stickker",
        quantity: 1,
        unitPrice: 0.01,
        price: 0.01,
        VATRate: 18,
        VATAmount: 0.00
      }
    ],
    totalVAT: 0.00,
    grandTotal: 0.01,
    grandTotalInclVAT: 0.01,
    paymentTotal: 0.01
  });
}

main();
