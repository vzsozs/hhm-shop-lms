// Támogatott nyelvek listája - KÜLÖN FÁJLBAN hogy kliens oldalon is biztonságos legyen az import
export const SUPPORTED_LANGUAGES = ["hu", "en", "sk"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
