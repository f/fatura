import { convertToText } from "number-to-text";
import "number-to-text/converters/tr";

export function convertNumber(number: number | string): string {
  return convertToText(number, {
    language: "tr",
    case: "upperCase",
  });
}

export function convertPriceToText(price: number): string {
  const parts = price.toFixed(2).split(".");
  const main = parts[0];
  let sub = parts[1];
  if (sub === "00") sub = "0";
  return `${convertNumber(main)} LIRA ${convertNumber(sub)} KURUS`;
}
