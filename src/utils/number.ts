const ones = ["", "BİR", "İKİ", "ÜÇ", "DÖRT", "BEŞ", "ALTI", "YEDİ", "SEKİZ", "DOKUZ"];
const tens = ["", "ON", "YİRMİ", "OTUZ", "KIRK", "ELLİ", "ALTMIŞ", "YETMİŞ", "SEKSEN", "DOKSAN"];

function convertHundreds(n: number): string {
    const parts: string[] = [];
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const o = n % 10;
    if (h === 1) parts.push("YÜZ");
    else if (h > 1) parts.push(ones[h] + " YÜZ");
    if (t > 0) parts.push(tens[t]);
    if (o > 0) parts.push(ones[o]);
    return parts.join(" ");
}

function toTurkish(n: number): string {
    if (n === 0) return "SIFIR";
    const parts: string[] = [];
    const milyar = Math.floor(n / 1_000_000_000);
    const milyon = Math.floor((n % 1_000_000_000) / 1_000_000);
    const bin = Math.floor((n % 1_000_000) / 1_000);
    const rest = n % 1_000;
    if (milyar > 0) parts.push(convertHundreds(milyar) + " MİLYAR");
    if (milyon > 0) parts.push(convertHundreds(milyon) + " MİLYON");
    if (bin === 1) parts.push("BİN");
    else if (bin > 1) parts.push(convertHundreds(bin) + " BİN");
    if (rest > 0) parts.push(convertHundreds(rest));
    return parts.join(" ");
}

export function convertNumber(number: number | string): string {
    const n = typeof number === "string" ? parseInt(number, 10) : Math.floor(number);
    return toTurkish(n);
}

export function convertPriceToText(price: number): string {
    const parts = price.toFixed(2).split(".");
    const main = parts[0];
    let sub = parts[1];
    if (sub === "00") sub = "0";
    return `${convertNumber(main)} LIRA ${convertNumber(sub)} KURUS`;
}
