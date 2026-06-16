import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-xl p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">จัดการบัญชีผู้ใช้ (Account Settings)</h1>
        
        <ProfileForm initialName={session.user.name || ""} />
      </div>
    </div>
  );
}
