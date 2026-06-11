"use server";

import prisma from "@/lib/prisma";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getProvincesByHealthRegion } from "@/lib/healthRegions";

export async function getDashboardStats(filterRegion?: string, filterProvince?: string) {
  const session = await getServerSession(authOptions);
  let userAreaFilter: any = {};
  
  if (session?.user?.id && session.user.role === "SBS") {
    if (filterProvince && filterProvince !== "all") {
      userAreaFilter = { area: { province: filterProvince } };
    } else if (filterRegion && filterRegion !== "all") {
      const provinces = getProvincesByHealthRegion(filterRegion);
      if (provinces.length > 0) {
        userAreaFilter = { area: { province: { in: provinces } } };
      }
    }
  } else if (session?.user?.id && session.user.role !== "ADMIN" && session.user.role !== "SBS") {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { area: true }
    });

    if (user?.area) {
      if (session.user.role === 'SSJ') {
        userAreaFilter = { area: { province: user.area.province } };
      } else if (session.user.role === 'SSO') {
        userAreaFilter = { area: { district: user.area.district } };
      } else if (session.user.role === 'RH_ST' || session.user.role === 'OSP') {
        userAreaFilter = { areaId: user.area.id };
      }
    }
  }

  // Filter conditions for relations
  const visitWhere = Object.keys(userAreaFilter).length > 0 ? { createdBy: userAreaFilter } : {};
  const planWhere = Object.keys(userAreaFilter).length > 0 ? { assignedTo: userAreaFilter } : {};
  const patientWhere = Object.keys(userAreaFilter).length > 0 ? {
    homeVisits: { some: { createdBy: userAreaFilter } } // Only patients who have visits in this area
  } : {};

  const totalPatients = await prisma.patient.count({ where: patientWhere });
  const totalVisits = await prisma.homeVisit.count({ where: visitWhere });
  
  const visitsByStatus = await prisma.homeVisit.groupBy({
    by: ['status'],
    where: visitWhere,
    _count: true,
  });

  const patients = await prisma.patient.findMany({
    where: patientWhere,
    select: {
      isGroup1A: true,
      isGroup1B: true,
      isGroup2: true,
      isGroup3: true,
      isGroup4: true,
    }
  });

  let groupStats = {
    group1A: 0,
    group1B: 0,
    group2: 0,
    group3: 0,
    group4: 0,
  };

  patients.forEach(p => {
    if (p.isGroup1A) groupStats.group1A++;
    if (p.isGroup1B) groupStats.group1B++;
    if (p.isGroup2) groupStats.group2++;
    if (p.isGroup3) groupStats.group3++;
    if (p.isGroup4) groupStats.group4++;
  });

  // Calculate care plan completion
  const totalPlans = await prisma.carePlan.count({ where: planWhere });
  const approvedPlans = await prisma.carePlan.count({ where: { ...planWhere, status: 'APPROVED' } });
  
  return {
    totalPatients,
    totalVisits,
    visitsByStatus,
    groupStats,
    totalPlans,
    approvedPlans,
  };
}
