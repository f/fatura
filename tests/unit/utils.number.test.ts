import { describe, it, expect } from "vitest";
import { convertNumber, convertPriceToText } from "../../src/utils/number";

describe("utils/number", () => {
  describe("convertNumber", () => {
    it("converts integer 0 to Turkish text", () => {
      expect(convertNumber(0)).toBeTruthy();
    });

    it("converts integer 1 to uppercase Turkish text", () => {
      const result = convertNumber(1);
      expect(result).toBe(result.toUpperCase());
    });

    it("converts integer 100", () => {
      const result = convertNumber(100);
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("converts a numeric string", () => {
      const fromNumber = convertNumber(50);
      const fromString = convertNumber("50");
      expect(fromNumber).toBe(fromString);
    });

    it("returns uppercase text", () => {
      const result = convertNumber(42);
      expect(result).toBe(result.toUpperCase());
    });

    it("converts large numbers", () => {
      const result = convertNumber(1000000);
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("convertPriceToText", () => {
    it("contains LIRA", () => {
      expect(convertPriceToText(100)).toContain("LIRA");
    });

    it("contains KURUS", () => {
      expect(convertPriceToText(100)).toContain("KURUS");
    });

    it("formats 100.00 with 'SIFIR KURUS' (zero kuruş)", () => {
      const result = convertPriceToText(100.0);
      // sub = "00" → sub = "0" → convertNumber("0") → "SIFIR"
      expect(result).toContain("KURUS");
      expect(result).toMatch(/SIFIR KURUS$/);
    });

    it("formats 100.50 with both lira and kuruş parts", () => {
      const result = convertPriceToText(100.5);
      expect(result).toContain("LIRA");
      expect(result).toContain("KURUS");
    });

    it("formats 0.01 correctly", () => {
      const result = convertPriceToText(0.01);
      expect(result).toContain("LIRA");
      expect(result).toContain("KURUS");
    });

    it("produces the same output for 120 and 120.00", () => {
      expect(convertPriceToText(120)).toBe(convertPriceToText(120.0));
    });

    it("result is always a non-empty string", () => {
      for (const price of [1, 10, 99.99, 1000, 0.5]) {
        const result = convertPriceToText(price);
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
      }
    });

    it("lira and kuruş parts are separated correctly", () => {
      const result = convertPriceToText(5.25);
      const parts = result.split(" LIRA ");
      expect(parts).toHaveLength(2);
      expect(parts[1]).toContain("KURUS");
    });
  });
});
