"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function getUsers() {
  return await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      area: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRegistrationRequests() {
  return await prisma.registrationRequest.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAreas() {
  return await prisma.area.findMany({
    orderBy: [
      { province: "asc" },
      { district: "asc" },
      { subDistrict: "asc" }
    ]
  });
}

export async function getOrCreateArea(province: string, district: string, subDistrict: string, zipCode?: string) {
  if (!province) return null;
  
  let area = await prisma.area.findFirst({
    where: {
      province,
      district: district || "-",
      subDistrict: subDistrict || "-"
    }
  });

  if (!area) {
    area = await prisma.area.create({
      data: {
        province,
        district: district || "-",
        subDistrict: subDistrict || "-",
        zipCode: zipCode ? String(zipCode) : null
      }
    });
  }

  return area.id;
}


export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id },
    });
    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete user." };
  }
}

export async function updateUserArea(id: string, areaId: string | null) {
  try {
    await prisma.user.update({
      where: { id },
      data: { areaId },
    });
    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update user area." };
  }
}

export async function updateUserAreaByData(id: string, province: string, district: string, subDistrict: string, zipCode: string, role: string) {
  try {
    let areaId = null;
    if (role !== "ADMIN" && role !== "SBS" && province) {
      areaId = await getOrCreateArea(province, district, subDistrict, zipCode);
    }
    await prisma.user.update({
      where: { id },
      data: { areaId },
    });
    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update user area." };
  }
}

export async function updateUser(id: string, data: any) {
  try {
    const existing = await prisma.user.findUnique({
      where: { username: data.username },
    });
    if (existing && existing.id !== id) {
      return { error: "Username already exists." };
    }

    let areaId = data.areaId || null;
    
    // If geographical data is provided directly (from 2026 dataset UI)
    if (data.province && data.role !== "ADMIN" && data.role !== "SBS") {
      areaId = await getOrCreateArea(data.province, data.district, data.subDistrict, data.zipCode);
    } else if (data.role === "ADMIN" || data.role === "SBS") {
      areaId = null;
    }

    const updateData: any = {
      username: data.username,
      name: data.name,
      role: data.role,
      areaId,
    };

    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });
    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update user." };
  }
}

export async function approveRegistration(id: string) {
  try {
    const req = await prisma.registrationRequest.findUnique({ where: { id } });
    if (!req) return { error: "Request not found" };

    let areaId = null;
    if (req.role !== "ADMIN" && req.role !== "SBS" && req.province) {
      areaId = await getOrCreateArea(req.province, req.district || "-", req.subDistrict || "-", req.zipCode || undefined);
    }

    await prisma.$transaction([
      prisma.user.create({
        data: {
          username: req.username,
          passwordHash: req.passwordHash,
          name: req.name,
          role: req.role,
          areaId,
        }
      }),
      prisma.registrationRequest.update({
        where: { id },
        data: { status: "APPROVED" }
      })
    ]);

    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error: any) {
    console.error("Approve registration error:", error);
    return { error: "Failed to approve registration." };
  }
}

export async function rejectRegistration(id: string) {
  try {
    await prisma.registrationRequest.update({
      where: { id },
      data: { status: "REJECTED" }
    });
    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error: any) {
    console.error("Reject registration error:", error);
    return { error: "Failed to reject registration." };
  }
}
