const fs = require('fs');
const pdf = require('pdf-parse');

const path = 'design_temp/Mufis-Fullpost-API-integracio-v-1-1.pdf';

(async () => {
  try {
    let dataBuffer = fs.readFileSync(path);
    const pdfFn = typeof pdf === 'function' ? pdf : (pdf.default || pdf.pdf);
    const data = await pdfFn(dataBuffer);
    console.log("--- PDF SZÖVEG KEZDETE ---");
    console.log(data.text);
    console.log("--- PDF SZÖVEG VÉGE ---");
  } catch(e) {
    console.error("Fájl beolvasási hiba:", e);
    console.log("Exported keys:", Object.keys(pdf));
  }
})();
