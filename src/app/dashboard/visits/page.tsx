import { getVisits } from "./actions";
import VisitTable from "./VisitTable";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function VisitsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "RH_ST" && session.user.role !== "SSO" && session.user.role !== "OSP" && session.user.role !== "SSJ" && session.user.role !== "SBS")) {
    redirect("/login");
  }

  const visits = await getVisits();

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">บันทึกการเยี่ยมบ้าน (Home Visits)</h1>
          <p className="mt-2 text-sm text-gray-700">
            {session.user.role === "OSP" ? "บันทึกผลการเยี่ยมบ้านและการประเมินสุขภาพของผู้รับบริการ" : "ตรวจสอบผลการเยี่ยมบ้านที่ อสพ. ส่งเข้ามา"}
          </p>
        </div>
      </div>
      <div className="mt-8">
        <VisitTable visits={visits} role={session.user.role} />
      </div>
    </div>
  );
}
