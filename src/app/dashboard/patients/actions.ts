"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getPatients() {
  const session = await getServerSession(authOptions);
  let whereClause: any = {};

  if (session?.user?.id && (session.user.role === "RH_ST" || session.user.role === "SSO" || session.user.role === "SSJ")) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { area: true }
    });
    
    if (user?.area) {
      if (session.user.role === "RH_ST" && user.area.id) {
        whereClause = { areaId: user.area.id };
      } else if (session.user.role === "SSO" && user.area.district) {
        whereClause = { area: { district: user.area.district } };
      } else if (session.user.role === "SSJ") {
        whereClause = { area: { province: user.area.province } };
      }
    } else {
      return []; // Secure fallback
    }
  }

  const data = await prisma.patient.findMany({
    where: whereClause,
    include: { area: true },
    orderBy: { createdAt: "desc" },
  });
  
  return data.map((p) => ({
    ...p,
    dob: p.dob.toISOString(),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));
}

export async function getAreas() {
  const session = await getServerSession(authOptions);
  let whereClause = {};

  if (session?.user?.id) {
    if (session.user.role === "RH_ST") {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { area: true }
      });

      if (user?.area) {
        whereClause = { id: user.area.id };
        whereClause = { id: user.area.id };
      } else {
        return []; // No area assigned
      }
    } else if (session.user.role === "SSO") {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { area: true }
      });

      if (user?.area?.district) {
        whereClause = { district: user.area.district };
      } else if (user?.area) {
        whereClause = { id: user.area.id };
      } else {
        return []; // No area assigned
      }
    }
  }

  return await prisma.area.findMany({
    where: whereClause,
    orderBy: [
      { province: "asc" },
      { district: "asc" },
      { subDistrict: "asc" }
    ]
  });
}

export async function createPatient(data: any) {
  try {
    const session = await getServerSession(authOptions);
    
    // Server-side authorization check for RH_ST
    if (session?.user?.role === "RH_ST" && data.areaId) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { area: true }
      });
      
      if (user?.area?.id) {
        const targetArea = await prisma.area.findUnique({ where: { id: data.areaId } });
        if (targetArea?.id !== user.area.id) {
          return { error: "ไม่อนุญาตให้เพิ่มผู้รับบริการนอกเขตพื้นที่รับผิดชอบ (ตำบล)" };
        }
      }
    }

    // Server-side authorization check for SSO
    if (session?.user?.role === "SSO" && data.areaId) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { area: true }
      });
      
      if (user?.area?.district) {
        const targetArea = await prisma.area.findUnique({ where: { id: data.areaId } });
        if (targetArea?.district !== user.area.district) {
          return { error: "ไม่อนุญาตให้เพิ่มผู้รับบริการนอกเขตพื้นที่รับผิดชอบ (อำเภอ)" };
        }
      }
    }

    const existing = await prisma.patient.findUnique({
      where: { cid: data.cid },
    });
    
    if (existing) {
      return { error: "เลขบัตรประชาชนนี้มีอยู่ในระบบแล้ว" };
    }

    await prisma.patient.create({
      data: {
        cid: data.cid,
        hn: data.hn,
        prefix: data.prefix || "",
        name: data.name,
        dob: new Date(data.dob),
        gender: data.gender,
        insurance: data.insurance || "",
        address: data.address,
        phone: data.phone,
        lineId: data.lineId,
        caregiverName: data.caregiverName,
        caregiverPhone: data.caregiverPhone,
        caregiverRelation: data.caregiverRelation,
        distanceFromHospital: data.distanceFromHospital ? parseFloat(data.distanceFromHospital) : null,
        gpsLat: data.gpsLat,
        gpsLng: data.gpsLng,
        isGroup1A: data.isGroup1A,
        isGroup1B: data.isGroup1B,
        isGroup2: data.isGroup2,
        isGroup3: data.isGroup3,
        isGroup4: data.isGroup4,
        areaId: data.areaId || null,
      },
    });

    revalidatePath("/dashboard/patients");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to create patient." };
  }
}

export async function deletePatient(id: string) {
  try {
    await prisma.patient.delete({
      where: { id },
    });
    revalidatePath("/dashboard/patients");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete patient." };
  }
}

export async function updatePatient(id: string, data: any) {
  try {
    const session = await getServerSession(authOptions);
    
    // Server-side authorization check for RH_ST
    if (session?.user?.role === "RH_ST" && data.areaId) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { area: true }
      });
      
      if (user?.area?.id) {
        const targetArea = await prisma.area.findUnique({ where: { id: data.areaId } });
        if (targetArea?.id !== user.area.id) {
          return { error: "ไม่อนุญาตให้ย้ายผู้รับบริการไปยังพื้นที่นอกเขตรับผิดชอบ (ตำบล)" };
        }
      }
    }

    // Server-side authorization check for SSO
    if (session?.user?.role === "SSO" && data.areaId) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { area: true }
      });
      
      if (user?.area?.district) {
        const targetArea = await prisma.area.findUnique({ where: { id: data.areaId } });
        if (targetArea?.district !== user.area.district) {
          return { error: "ไม่อนุญาตให้ย้ายผู้รับบริการไปยังพื้นที่นอกเขตรับผิดชอบ (อำเภอ)" };
        }
      }
    }

    await prisma.patient.update({
      where: { id },
      data: {
        hn: data.hn,
        prefix: data.prefix || "",
        name: data.name,
        dob: new Date(data.dob),
        gender: data.gender,
        insurance: data.insurance || "",
        address: data.address,
        phone: data.phone,
        lineId: data.lineId,
        caregiverName: data.caregiverName,
        caregiverPhone: data.caregiverPhone,
        caregiverRelation: data.caregiverRelation,
        distanceFromHospital: data.distanceFromHospital ? parseFloat(data.distanceFromHospital) : null,
        gpsLat: data.gpsLat,
        gpsLng: data.gpsLng,
        isGroup1A: data.isGroup1A,
        isGroup1B: data.isGroup1B,
        isGroup2: data.isGroup2,
        isGroup3: data.isGroup3,
        isGroup4: data.isGroup4,
        areaId: data.areaId || null,
      },
    });

    revalidatePath("/dashboard/patients");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update patient." };
  }
}
