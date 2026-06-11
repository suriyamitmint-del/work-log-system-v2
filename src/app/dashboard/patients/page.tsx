import { getPatients, getAreas } from "./actions";
import PatientTable from "./PatientTable";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function PatientsPage() {
  const session = await getServerSession(authOptions);
  
  // Both ADMIN and RH_ST can view/manage patients
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "RH_ST" && session.user.role !== "SSO")) {
    redirect("/dashboard");
  }

  const patients = await getPatients();
  const areas = await getAreas();

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">จัดการข้อมูลผู้รับบริการ (Patients)</h1>
          <p className="mt-2 text-sm text-gray-700">
            รายชื่อผู้รับบริการทั้งหมดในความรับผิดชอบ สามารถเพิ่ม ลบ และดูรายละเอียดได้
          </p>
        </div>
      </div>
      <div className="mt-8">
        <PatientTable patients={patients} areas={areas} />
      </div>
    </div>
  );
}
