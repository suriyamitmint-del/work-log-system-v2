import { getUsers, getAreas, getRegistrationRequests } from "./actions";
import UsersPageClient from "./UsersPageClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await getUsers();
  const areas = await getAreas();
  const pendingRequests = await getRegistrationRequests();

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">จัดการผู้ใช้งาน (User Management)</h1>
          <p className="mt-2 text-sm text-gray-700">
            รายชื่อผู้ใช้งานทั้งหมดในระบบ รวมถึง อสพ., รพ.สต., สสอ., สสจ., และ สบส.
          </p>
        </div>
      </div>
      <div className="mt-6">
        <UsersPageClient users={users} areas={areas} pendingRequests={pendingRequests} />
      </div>
    </div>
  );
}
