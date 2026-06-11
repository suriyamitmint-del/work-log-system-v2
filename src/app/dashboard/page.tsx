"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="p-8 text-center">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="w-full">


      <main className="p-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">ยินดีต้อนรับสู่ระบบ</h2>
          {/* Dashboard menu grid will be here depending on role */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {session?.user?.role === "ADMIN" && (
              <Link href="/dashboard/users" className="block">
                <div className="h-full p-6 bg-blue-50 border border-blue-100 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                  <h3 className="font-semibold text-blue-900">จัดการผู้ใช้งาน (User Management)</h3>
                  <p className="text-sm text-blue-700 mt-2">เพิ่ม/ลบ/แก้ไขข้อมูลผู้ใช้งานและสิทธิ์การเข้าถึง</p>
                </div>
              </Link>
            )}
            {(session?.user?.role === "ADMIN" || session?.user?.role === "RH_ST" || session?.user?.role === "SSO") && (
              <Link href="/dashboard/patients" className="block">
                <div className="h-full p-6 bg-green-50 border border-green-100 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
                  <h3 className="font-semibold text-green-900">ทะเบียนผู้รับบริการ (Patients)</h3>
                  <p className="text-sm text-green-700 mt-2">จัดการข้อมูลผู้รับบริการและแฟ้มประวัติสุขภาพ</p>
                </div>
              </Link>
            )}
            
            {(session?.user?.role === "ADMIN" || session?.user?.role === "RH_ST" || session?.user?.role === "SSO" || session?.user?.role === "OSP") && (
              <Link href="/dashboard/careplans" className="block">
                <div className="h-full p-6 bg-yellow-50 border border-yellow-100 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors">
                  <h3 className="font-semibold text-yellow-900">แผนการดูแล (Care Plans)</h3>
                  <p className="text-sm text-yellow-700 mt-2">จ่ายงานและมอบหมายการดูแลผู้รับบริการ (สำหรับ รพ.สต.) และดูงานที่ได้รับมอบหมาย (สำหรับ อสพ.)</p>
                </div>
              </Link>
            )}
            
            <Link href="/dashboard/visits" className="block">
              <div className="h-full p-6 bg-purple-50 border border-purple-100 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors">
                <h3 className="font-semibold text-purple-900">บันทึกการเยี่ยมบ้าน (Home Visits)</h3>
                <p className="text-sm text-purple-700 mt-2">บันทึกและประเมินผลสุขภาพ</p>
              </div>
            </Link>
            <Link href="/dashboard/reports" className="block">
              <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors h-full">
                <h3 className="font-semibold text-indigo-900">รายงานสรุป (Reports)</h3>
                <p className="text-sm text-indigo-700 mt-2">ดูภาพรวมและสถิติข้อมูลสุขภาพ (สำหรับ สสจ., สบส., ผู้บริหาร)</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
