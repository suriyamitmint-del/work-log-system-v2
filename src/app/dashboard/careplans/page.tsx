import { getCarePlans, getPatientsAndOSPs } from "./actions";
import CarePlanTable from "./CarePlanTable";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function CarePlansPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "RH_ST" && session.user.role !== "SSO" && session.user.role !== "OSP")) {
    redirect("/dashboard");
  }

  // If user is OSP, they only see care plans assigned to them (Wait, for now we fetch all, filtering logic can be added)
  // To keep it simple, we fetch all for now, but will filter for OSP.
  const allCarePlans = await getCarePlans();
  const carePlans = session.user.role === "OSP" 
    ? allCarePlans.filter(cp => cp.assignedToId === session.user.id)
    : allCarePlans;

  const { patients, osps } = await getPatientsAndOSPs();

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">แผนการดูแล (Care Plans)</h1>
          <p className="mt-2 text-sm text-gray-700">
            {session.user.role === "OSP" ? "แผนการดูแลที่คุณได้รับมอบหมาย" : "สร้างและจ่ายงานให้ อสพ. เพื่อลงพื้นที่เยี่ยมบ้าน"}
          </p>
        </div>
      </div>
      <div className="mt-8">
        <CarePlanTable carePlans={carePlans} patients={patients} osps={osps} role={session.user.role} />
      </div>
    </div>
  );
}
