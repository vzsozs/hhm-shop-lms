export function verifyMufisAuth(req: Request) {
  const apiKey = req.headers.get("api-key") || req.headers.get("API-Key") || req.headers.get("API-KEY");
  const expectedKey = process.env.MUFIS_API_KEY;

  if (!expectedKey) {
    console.warn("Nincs beállítva a MUFIS_API_KEY környezeti változó az .env fájlban!");
    return false;
  }

  return apiKey === expectedKey;
}
