"use client";

import { useState } from "react";
import { approveRegistration, rejectRegistration } from "./actions";
import { CheckCircle, XCircle } from "lucide-react";

export default function PendingRequestsTable({ requests }: { requests: any[] }) {
  const [processing, setProcessing] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    if (confirm("ยืนยันการอนุมัติผู้ใช้งานนี้?")) {
      setProcessing(id);
      await approveRegistration(id);
      setProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    if (confirm("แน่ใจหรือไม่ว่าต้องการปฏิเสธคำขอลงทะเบียนนี้? ข้อมูลจะถูกลบออก")) {
      setProcessing(id);
      await rejectRegistration(id);
      setProcessing(null);
    }
  };

  if (requests.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center text-gray-500">
        ไม่มีคำขอลงทะเบียนที่รอการอนุมัติ
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
              วันที่สมัคร
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              ชื่อ-นามสกุล / Username
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              สิทธิ์ (Role)
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              พื้นที่ที่ขอ
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {requests.map((req) => (
            <tr key={req.id}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-6">
                {new Date(req.createdAt).toLocaleString("th-TH")}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                <div className="font-medium">{req.name}</div>
                <div className="text-gray-500">{req.username}</div>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                  req.role === 'ADMIN' ? 'bg-red-50 text-red-700 ring-red-600/10' :
                  req.role === 'OSP' ? 'bg-green-50 text-green-700 ring-green-600/10' :
                  req.role === 'RH_ST' ? 'bg-blue-50 text-blue-700 ring-blue-600/10' :
                  req.role === 'SSO' ? 'bg-indigo-50 text-indigo-700 ring-indigo-600/10' :
                  'bg-gray-50 text-gray-700 ring-gray-600/10'
                }`}>
                  {req.role}
                </span>
              </td>
              <td className="whitespace-normal px-3 py-4 text-sm text-gray-500 max-w-xs">
                {req.role === 'SSJ' ? `จ.${req.province || '-'}` :
                 req.role === 'SSO' ? `อ.${req.district || '-'} จ.${req.province || '-'}` :
                 `ต.${req.subDistrict || '-'} อ.${req.district || '-'} จ.${req.province || '-'}`}
              </td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => handleApprove(req.id)}
                    disabled={processing === req.id}
                    className="text-green-600 hover:text-green-900 flex items-center gap-1 disabled:opacity-50"
                    title="อนุมัติ"
                  >
                    <CheckCircle size={18} />
                    <span className="hidden sm:inline">อนุมัติ</span>
                  </button>
                  <button
                    onClick={() => handleReject(req.id)}
                    disabled={processing === req.id}
                    className="text-red-600 hover:text-red-900 flex items-center gap-1 disabled:opacity-50"
                    title="ปฏิเสธ"
                  >
                    <XCircle size={18} />
                    <span className="hidden sm:inline">ปฏิเสธ</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
