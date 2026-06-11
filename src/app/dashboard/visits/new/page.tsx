import { getActiveCarePlans } from "../actions";
import VisitForm from "./VisitForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function NewVisitPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "OSP") {
    redirect("/dashboard/visits");
  }

  const activePlans = await getActiveCarePlans();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">บันทึกการเยี่ยมบ้าน</h1>
        <p className="mt-1 text-sm text-gray-500">
          กรุณาเลือกผู้รับบริการที่ได้รับมอบหมาย และกรอกข้อมูลประเมินสุขภาพ
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <VisitForm activePlans={activePlans} />
      </div>
    </div>
  );
}
