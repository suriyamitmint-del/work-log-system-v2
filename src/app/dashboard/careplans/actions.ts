"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getCarePlans() {
  const session = await getServerSession(authOptions);
  if (!session) return [];

  let whereClause: any = {};
  
  if (session.user.role === "OSP") {
    whereClause = { assignedToId: session.user.id };
  } else if (session.user.role === "RH_ST" || session.user.role === "SSO" || session.user.role === "SSJ") {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { area: true }
    });
    
    if (user?.area) {
      if (session.user.role === "RH_ST") {
        whereClause.assignedTo = { areaId: user.area.id };
      } else if (session.user.role === "SSO" && user.area.district) {
        whereClause.assignedTo = { area: { district: user.area.district } };
      } else if (session.user.role === "SSJ") {
        whereClause.assignedTo = { area: { province: user.area.province } };
      }
    } else {
      return []; // Secure fallback
    }
  }

  const plans = await prisma.carePlan.findMany({
    where: whereClause,
    include: {
      patient: true,
      assignedTo: true,
      approvedBy: true,
    },
    orderBy: { createdAt: "desc" },
  });
  
  return plans.map(p => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    patient: p.patient ? {
      ...p.patient,
      dob: p.patient.dob.toISOString(),
      createdAt: p.patient.createdAt.toISOString(),
      updatedAt: p.patient.updatedAt.toISOString(),
    } : null
  }));
}

export async function getPatientsAndOSPs() {
  const session = await getServerSession(authOptions);
  let ospWhereClause: any = { role: "OSP" };
  let patientWhereClause: any = {};

  if (session?.user?.id && session.user.role === "RH_ST") {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { area: true }
    });
    
    if (user?.area?.id) {
      ospWhereClause = { 
        ...ospWhereClause, 
        areaId: user.area.id 
      };
      patientWhereClause = { 
        areaId: user.area.id 
      };
    } else {
      ospWhereClause = { id: "none" };
      patientWhereClause = { id: "none" };
    }
  }

  const pts = await prisma.patient.findMany({ where: patientWhereClause });
  const osps = await prisma.user.findMany({
    where: ospWhereClause,
    select: { id: true, name: true, username: true },
  });
  
  const patients = pts.map(p => ({
    ...p,
    dob: p.dob.toISOString(),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));
  
  return { patients, osps };
}

export async function createCarePlan(data: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) return { error: "Unauthorized" };

    if (session.user.role === "RH_ST") {
      const creator = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { area: true }
      });
      if (creator?.area?.id) {
        const targetOSP = await prisma.user.findUnique({
          where: { id: data.assignedToId },
          include: { area: true }
        });
        if (targetOSP?.areaId !== creator.areaId) {
          return { error: "ไม่อนุญาตให้จ่ายงานให้ อสพ. นอกเขตพื้นที่รับผิดชอบ (ตำบลเดียวกัน)" };
        }
      }
    }

    await prisma.carePlan.create({
      data: {
        patientId: data.patientId,
        createdById: session.user.id,
        assignedToId: data.assignedToId,
        goals: data.goals,
        activityPlan: data.activityPlan,
        status: "PENDING", // SSO will approve it
      },
    });

    revalidatePath("/dashboard/careplans");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to create care plan." };
  }
}

export async function updateCarePlanStatus(id: string, status: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SSO")) {
      return { error: "Unauthorized to approve care plans" };
    }

    await prisma.carePlan.update({
      where: { id },
      data: { 
        status,
        approvedById: session.user.id,
        approvedAt: new Date(),
      },
    });
    revalidatePath("/dashboard/careplans");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update status." };
  }
}

export async function deleteCarePlan(id: string) {
  try {
    await prisma.carePlan.delete({
      where: { id },
    });
    revalidatePath("/dashboard/careplans");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete care plan." };
  }
}
