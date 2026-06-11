"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getVisits() {
  const session = await getServerSession(authOptions);
  if (!session) return [];

  // OSP sees only their visits, RH_ST/SSO sees all visits submitted to them, ADMIN sees all
  let whereClause: any = {};
  if (session.user.role === "OSP") {
    whereClause = { createdById: session.user.id };
  } else if (session.user.role === "RH_ST" || session.user.role === "SSO") {
    whereClause = {
      status: { in: ["SUBMITTED_TO_RH_ST", "APPROVED_BY_RH_ST", "APPROVED_BY_SSO", "APPROVED_BY_SSJ"] }
    };
  } else if (session.user.role === "SSJ") {
    whereClause = {
      status: { in: ["APPROVED_BY_SSO", "APPROVED_BY_SSJ"] }
    };
  } else if (session.user.role === "SBS") {
    whereClause = {
      status: "APPROVED_BY_SSJ"
    };
  }

  // Geographic filtering
  if (session.user.role === "RH_ST" || session.user.role === "SSO" || session.user.role === "SSJ") {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { area: true }
    });
    
    if (user?.area) {
      if (session.user.role === "RH_ST" && user.area.id) {
        whereClause.createdBy = { areaId: user.area.id };
      } else if (session.user.role === "SSO" && user.area.district) {
        whereClause.createdBy = { area: { district: user.area.district } };
      } else if (session.user.role === "SSJ") {
        whereClause.createdBy = { area: { province: user.area.province } };
      }
    } else {
      return []; // Secure fallback: If they don't have an area, don't show visits
    }
  }

  const visits = await prisma.homeVisit.findMany({
    where: whereClause,
    include: {
      patient: true,
      createdBy: {
        include: { area: true }
      },
      carePlan: true,
      rhstApprover: true,
      ssoApprover: true,
      ssjApprover: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return visits.map(v => ({
    ...v,
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
    patient: v.patient ? {
      ...v.patient,
      dob: v.patient.dob.toISOString(),
      createdAt: v.patient.createdAt.toISOString(),
      updatedAt: v.patient.updatedAt.toISOString(),
    } : null,
    carePlan: v.carePlan ? {
      ...v.carePlan,
      createdAt: v.carePlan.createdAt.toISOString(),
      updatedAt: v.carePlan.updatedAt.toISOString(),
    } : null,
  }));
}

export async function getActiveCarePlans() {
  const session = await getServerSession(authOptions);
  if (!session) return [];

  let whereClause: any = { status: "APPROVED" };
  if (session.user.role === "OSP") {
    whereClause.assignedToId = session.user.id;
  }

  const plans = await prisma.carePlan.findMany({
    where: whereClause,
    include: { patient: true },
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
    } : null,
  }));
}

export async function createVisit(data: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) return { error: "Unauthorized" };

    await prisma.homeVisit.create({
      data: {
        patientId: data.patientId,
        createdById: session.user.id,
        carePlanId: data.carePlanId || null,
        bloodPressure: data.bloodPressure,
        bloodSugar: data.bloodSugar ? parseFloat(data.bloodSugar) : null,
        weight: data.weight ? parseFloat(data.weight) : null,
        height: data.height ? parseFloat(data.height) : null,
        temperature: data.temperature ? parseFloat(data.temperature) : null,
        pulse: data.pulse ? parseInt(data.pulse) : null,
        adlScore: data.adlScore !== undefined ? parseInt(data.adlScore) : null,
        q2Score: data.q2Score !== undefined ? parseInt(data.q2Score) : null,
        q9Score: data.q9Score !== undefined ? parseInt(data.q9Score) : null,
        st5Score: data.st5Score !== undefined ? parseInt(data.st5Score) : null,
        notes: data.notes,
        activityResults: data.activityResults,
        gpsLat: data.gpsLat,
        gpsLng: data.gpsLng,
        imageUrl: data.imageUrl,
        status: data.submit ? "SUBMITTED_TO_RH_ST" : "DRAFT",
      },
    });

    revalidatePath("/dashboard/visits");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to save visit." };
  }
}

export async function updateVisitStatus(id: string, status: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) return { error: "Unauthorized" };

    const updateData: any = { status };
    if (status === "APPROVED_BY_RH_ST") {
      updateData.rhstApproverId = session.user.id;
      updateData.rhstApprovedAt = new Date();
    } else if (status === "APPROVED_BY_SSO") {
      updateData.ssoApproverId = session.user.id;
      updateData.ssoApprovedAt = new Date();
    } else if (status === "APPROVED_BY_SSJ") {
      updateData.ssjApproverId = session.user.id;
      updateData.ssjApprovedAt = new Date();
    }

    await prisma.homeVisit.update({
      where: { id },
      data: updateData,
    });
    revalidatePath("/dashboard/visits");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update status." };
  }
}

export async function bulkUpdateVisitStatus(ids: string[], status: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) return { error: "Unauthorized" };

    const updateData: any = { status };
    if (status === "APPROVED_BY_RH_ST") {
      updateData.rhstApproverId = session.user.id;
      updateData.rhstApprovedAt = new Date();
    } else if (status === "APPROVED_BY_SSO") {
      updateData.ssoApproverId = session.user.id;
      updateData.ssoApprovedAt = new Date();
    } else if (status === "APPROVED_BY_SSJ") {
      updateData.ssjApproverId = session.user.id;
      updateData.ssjApprovedAt = new Date();
    }

    await prisma.homeVisit.updateMany({
      where: { id: { in: ids } },
      data: updateData,
    });
    revalidatePath("/dashboard/visits");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update statuses." };
  }
}
