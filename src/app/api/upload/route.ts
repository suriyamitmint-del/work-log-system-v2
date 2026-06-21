import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ดึงข้อมูล role และ username จาก session เพื่อนำไปสร้างโฟลเดอร์
    const user = session.user as any;
    const role = user.role || "UNKNOWN";
    const username = user.username || user.id;

    // === โค้ดสำหรับรันบนเซิร์ฟเวอร์จริง (VPS / Dedicated) ที่สามารถสร้างโฟลเดอร์ได้ ===
    const uploadDir = join(process.cwd(), "public", "uploads", role, username);
    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filename = `${uuidv4()}.${ext}`;
    const filePath = join(uploadDir, filename);
    await writeFile(filePath, buffer);
    const fileUrl = `/uploads/${role}/${username}/${filename}`;
    // =========================================================================

    // === โค้ดชั่วคราวสำหรับรันบน Vercel (ทดลองใช้) ===
    /*
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    let mimeType = "image/jpeg";
    if (ext === "png") mimeType = "image/png";
    else if (ext === "gif") mimeType = "image/gif";
    else if (ext === "webp") mimeType = "image/webp";

    const base64String = buffer.toString("base64");
    const fileUrl = `data:${mimeType};base64,${base64String}`;
    */
    // =========================================================================

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
