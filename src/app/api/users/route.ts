import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getOrCreateArea } from "@/app/dashboard/users/actions";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    const existing = await prisma.user.findUnique({
      where: { username: data.username },
    });
    if (existing) {
      return NextResponse.json({ error: "Username already exists." }, { status: 400 });
    }

    let areaId = data.areaId || null;
    
    if (data.province && data.role !== "ADMIN" && data.role !== "SBS") {
      areaId = await getOrCreateArea(data.province, data.district, data.subDistrict, data.zipCode);
    } else if (data.role === "ADMIN" || data.role === "SBS") {
      areaId = null;
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    
    await prisma.user.create({
      data: {
        username: data.username,
        passwordHash,
        name: data.name,
        role: data.role,
        areaId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("API create user error:", error);
    return NextResponse.json({ error: error.message || "Failed to create user." }, { status: 500 });
  }
}
