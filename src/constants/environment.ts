import type { EnvironmentKey, EnvConfig } from "../types";

export const ENV: Record<EnvironmentKey, EnvConfig> = {
  PROD: { BASE_URL: "https://earsivportal.efatura.gov.tr" },
  TEST: { BASE_URL: "https://earsivportaltest.efatura.gov.tr" },
};
