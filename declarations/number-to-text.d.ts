declare module "number-to-text" {
  interface ConvertOptions {
    language: string;
    case?: "upperCase" | "lowerCase" | "titleCase";
  }
  function convertToText(number: number | string, options?: ConvertOptions): string;
  export { convertToText };
}

declare module "number-to-text/converters/tr" {
  // Side-effect only import — registers Turkish language converter
}
