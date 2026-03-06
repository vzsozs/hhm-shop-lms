import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nincs fájl feltöltve" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Kiterjesztés kinyerése originál fájlnévből
    const extension = path.extname(file.name);
    
    // Egyedi fájlnév generálása
    const uniqueFilename = `${crypto.randomUUID()}${extension}`;
    
    // Cél könyvtár meghatározása
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    
    // Könyvtár létrehozása, ha nem létezik
    await mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, uniqueFilename);
    
    // Fájl mentése
    await writeFile(filePath, buffer);
    
    // Publikus URL generálása
    const fileUrl = `/uploads/${uniqueFilename}`;

    return NextResponse.json({ 
      success: true, 
      url: fileUrl,
      fileName: file.name
    });

  } catch (error) {
    console.error("Hiba a fájlfeltöltés során:", error);
    return NextResponse.json({ error: "Hiba történt a fájl mentésekor" }, { status: 500 });
  }
}
