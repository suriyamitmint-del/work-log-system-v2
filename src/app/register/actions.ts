"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function submitRegistration(data: any) {
  try {
    // 1. Check if username exists in User table
    const existingUser = await prisma.user.findUnique({
      where: { username: data.username },
    });
    if (existingUser) {
      return { error: "ชื่อผู้ใช้นี้มีในระบบแล้ว กรุณาใช้ชื่ออื่น" };
    }

    // 2. Check if username exists in RegistrationRequest table
    const existingReq = await prisma.registrationRequest.findUnique({
      where: { username: data.username },
    });
    if (existingReq) {
      if (existingReq.status === "PENDING") {
        return { error: "ชื่อผู้ใช้นี้อยู่ระหว่างรอการอนุมัติ กรุณาใช้ชื่ออื่น" };
      } else if (existingReq.status === "REJECTED") {
        return { error: "ชื่อผู้ใช้นี้เคยถูกปฏิเสธการลงทะเบียน กรุณาใช้ชื่ออื่น" };
      } else {
        return { error: "ชื่อผู้ใช้นี้มีในระบบแล้ว กรุณาใช้ชื่ออื่น" };
      }
    }

    // 3. Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // 4. Create RegistrationRequest
    await prisma.registrationRequest.create({
      data: {
        username: data.username,
        passwordHash,
        name: data.name,
        role: data.role,
        region: data.region || null,
        province: data.province || null,
        district: data.district || null,
        subDistrict: data.subDistrict || null,
        zipCode: data.zipCode ? String(data.zipCode) : null,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Failed to submit registration:", error);
    return { error: "เกิดข้อผิดพลาดในการลงทะเบียน" };
  }
}
