"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Home, LogOut, UserCircle } from "lucide-react";

export default function DashboardNavbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white border-b border-gray-200 px-4 sm:px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors font-medium bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg"
        >
          <Home size={18} />
          <span>หน้าแรก</span>
        </Link>
        <h1 className="text-xl font-bold text-gray-900 hidden sm:block">ระบบบันทึกข้อมูลการดูแลกลุ่มเป้าหมาย</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <Link href="/dashboard/profile" className="flex items-center gap-2 group cursor-pointer">
          <div className="bg-indigo-100 p-2 rounded-full text-indigo-600 group-hover:bg-indigo-200 transition-colors">
            <UserCircle size={20} />
          </div>
          <div className="text-sm hidden sm:block text-right">
            <p className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">{session?.user?.name}</p>
            <p className="text-gray-500 text-xs">สิทธิ์: {session?.user?.role}</p>
          </div>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm hover:shadow"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">ออกจากระบบ</span>
        </button>
      </div>
    </nav>
  );
}
