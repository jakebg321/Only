import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), "public", "Remy");
    const files = await readdir(publicDir, { withFileTypes: true });
    const images = files
      .filter((f) => f.isFile())
      .map((f) => `/Remy/${f.name}`)
      .filter((src) => /(\.png|\.jpg|\.jpeg|\.gif|\.webp)$/i.test(src));

    return NextResponse.json({ images });
  } catch (_error) {
    return NextResponse.json({ images: [] }, { status: 200 });
  }
}

