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

    // สร้าง Path: public/uploads/[role]/[username]/
    const uploadDir = join(process.cwd(), "public", "uploads", role, username);
    
    // ตรวจสอบและสร้างโฟลเดอร์ถ้ายังไม่มี
    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // สร้างชื่อไฟล์ด้วย UUID กันซ้ำ
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filename = `${uuidv4()}.${ext}`;
    const filePath = join(uploadDir, filename);

    // บันทึกไฟล์ลง Server
    await writeFile(filePath, buffer);

    // URL สำหรับใช้แสดงผลในเว็บ
    const fileUrl = `/uploads/${role}/${username}/${filename}`;

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
