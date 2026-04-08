import { describe, it, expect } from "vitest";
import { convertNumber, convertPriceToText } from "../../src/utils/number";

describe("utils/number", () => {
    describe("convertNumber", () => {
        describe("sıfır", () => {
            it("0 → SIFIR", () => expect(convertNumber(0)).toBe("SIFIR"));
        });

        describe("birler (1-9)", () => {
            it("1 → BİR", () => expect(convertNumber(1)).toBe("BİR"));
            it("5 → BEŞ", () => expect(convertNumber(5)).toBe("BEŞ"));
            it("9 → DOKUZ", () => expect(convertNumber(9)).toBe("DOKUZ"));
        });

        describe("onlar (10-99)", () => {
            it("10 → ON", () => expect(convertNumber(10)).toBe("ON"));
            it("11 → ON BİR", () => expect(convertNumber(11)).toBe("ON BİR"));
            it("19 → ON DOKUZ", () => expect(convertNumber(19)).toBe("ON DOKUZ"));
            it("20 → YİRMİ", () => expect(convertNumber(20)).toBe("YİRMİ"));
            it("40 → KIRK", () => expect(convertNumber(40)).toBe("KIRK"));
            it("42 → KIRK İKİ", () => expect(convertNumber(42)).toBe("KIRK İKİ"));
            it("99 → DOKSAN DOKUZ", () => expect(convertNumber(99)).toBe("DOKSAN DOKUZ"));
        });

        describe("yüzler (100-999)", () => {
            it("100 → YÜZ (BİR YÜZ değil)", () => expect(convertNumber(100)).toBe("YÜZ"));
            it("101 → YÜZ BİR", () => expect(convertNumber(101)).toBe("YÜZ BİR"));
            it("110 → YÜZ ON", () => expect(convertNumber(110)).toBe("YÜZ ON"));
            it("111 → YÜZ ON BİR", () => expect(convertNumber(111)).toBe("YÜZ ON BİR"));
            it("200 → İKİ YÜZ", () => expect(convertNumber(200)).toBe("İKİ YÜZ"));
            it("500 → BEŞ YÜZ", () => expect(convertNumber(500)).toBe("BEŞ YÜZ"));
            it("999 → DOKUZ YÜZ DOKSAN DOKUZ", () => expect(convertNumber(999)).toBe("DOKUZ YÜZ DOKSAN DOKUZ"));
        });

        describe("binler (1000-999999)", () => {
            it("1000 → BİN (BİR BİN değil)", () => expect(convertNumber(1000)).toBe("BİN"));
            it("1001 → BİN BİR", () => expect(convertNumber(1001)).toBe("BİN BİR"));
            it("1100 → BİN YÜZ", () => expect(convertNumber(1100)).toBe("BİN YÜZ"));
            it("2000 → İKİ BİN", () => expect(convertNumber(2000)).toBe("İKİ BİN"));
            it("10000 → ON BİN", () => expect(convertNumber(10000)).toBe("ON BİN"));
            it("100000 → YÜZ BİN", () => expect(convertNumber(100000)).toBe("YÜZ BİN"));
            it("999999 → DOKUZ YÜZ DOKSAN DOKUZ BİN DOKUZ YÜZ DOKSAN DOKUZ", () =>
                expect(convertNumber(999999)).toBe("DOKUZ YÜZ DOKSAN DOKUZ BİN DOKUZ YÜZ DOKSAN DOKUZ"));
        });

        describe("milyonlar", () => {
            it("1000000 → BİR MİLYON", () => expect(convertNumber(1000000)).toBe("BİR MİLYON"));
            it("2000000 → İKİ MİLYON", () => expect(convertNumber(2000000)).toBe("İKİ MİLYON"));
            it("1500000 → BİR MİLYON BEŞ YÜZ BİN", () => expect(convertNumber(1500000)).toBe("BİR MİLYON BEŞ YÜZ BİN"));
        });

        describe("milyarlar", () => {
            it("1000000000 → BİR MİLYAR", () => expect(convertNumber(1000000000)).toBe("BİR MİLYAR"));
            it("2500000000 → İKİ MİLYAR BEŞ YÜZ MİLYON", () =>
                expect(convertNumber(2500000000)).toBe("İKİ MİLYAR BEŞ YÜZ MİLYON"));
        });

        describe("string girdi", () => {
            it("string '50' ile number 50 aynı sonucu verir", () => {
                expect(convertNumber("50")).toBe(convertNumber(50));
            });
            it("string '1000' → BİN", () => expect(convertNumber("1000")).toBe("BİN"));
            it("string '0' → SIFIR", () => expect(convertNumber("0")).toBe("SIFIR"));
        });

        describe("çıktı her zaman büyük harf", () => {
            it("42 sonucu uppercase", () => {
                const result = convertNumber(42);
                expect(result).toBe(result.toUpperCase());
            });
            it("999999 sonucu uppercase", () => {
                const result = convertNumber(999999);
                expect(result).toBe(result.toUpperCase());
            });
        });
    });

    describe("convertPriceToText", () => {
        it("0 → SIFIR LIRA SIFIR KURUS", () => expect(convertPriceToText(0)).toBe("SIFIR LIRA SIFIR KURUS"));

        it("1 → BİR LIRA SIFIR KURUS", () => expect(convertPriceToText(1)).toBe("BİR LIRA SIFIR KURUS"));

        it("100 → YÜZ LIRA SIFIR KURUS", () => expect(convertPriceToText(100)).toBe("YÜZ LIRA SIFIR KURUS"));

        it("100.50 → YÜZ LIRA ELLİ KURUS", () => expect(convertPriceToText(100.5)).toBe("YÜZ LIRA ELLİ KURUS"));

        it("100.05 → YÜZ LIRA BEŞ KURUS", () => expect(convertPriceToText(100.05)).toBe("YÜZ LIRA BEŞ KURUS"));

        it("0.01 → SIFIR LIRA BİR KURUS", () => expect(convertPriceToText(0.01)).toBe("SIFIR LIRA BİR KURUS"));

        it("0.99 → SIFIR LIRA DOKSAN DOKUZ KURUS", () =>
            expect(convertPriceToText(0.99)).toBe("SIFIR LIRA DOKSAN DOKUZ KURUS"));

        it("1250.75 → BİN İKİ YÜZ ELLİ LIRA YETMİŞ BEŞ KURUS", () =>
            expect(convertPriceToText(1250.75)).toBe("BİN İKİ YÜZ ELLİ LIRA YETMİŞ BEŞ KURUS"));

        it("120 ile 120.00 aynı sonucu verir", () => expect(convertPriceToText(120)).toBe(convertPriceToText(120.0)));

        it("format: 'X LIRA Y KURUS' şeklinde bölünür", () => {
            const result = convertPriceToText(5.25);
            const parts = result.split(" LIRA ");
            expect(parts).toHaveLength(2);
            expect(parts[0]).toBe("BEŞ");
            expect(parts[1]).toBe("YİRMİ BEŞ KURUS");
        });
    });
});
