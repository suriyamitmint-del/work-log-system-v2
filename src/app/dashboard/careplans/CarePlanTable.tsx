"use client";

import { useState } from "react";
import { deleteCarePlan, updateCarePlanStatus } from "./actions";
import CarePlanFormModal from "./CarePlanFormModal";
import { PlusCircle, Trash2, CheckCircle, XCircle, MapPin } from "lucide-react";

export default function CarePlanTable({ carePlans, patients, osps, role }: { carePlans: any[], patients: any[], osps: any[], role: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบแผนการดูแลนี้?")) {
      setIsProcessing(id);
      await deleteCarePlan(id);
      setIsProcessing(null);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    setIsProcessing(id);
    await updateCarePlanStatus(id, status);
    setIsProcessing(null);
  };

  return (
    <div>
      {(role === "ADMIN" || role === "RH_ST") && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <PlusCircle size={18} />
            จ่ายงาน / สร้างแผนการดูแล
          </button>
        </div>
      )}

      <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                ผู้รับบริการ
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                อสพ. ที่รับผิดชอบ
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                เป้าหมายการดูแล
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                สถานะ
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {carePlans.map((cp) => (
              <tr key={cp.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {cp.patient.prefix ? `${cp.patient.prefix}${cp.patient.name}` : cp.patient.name}
                  {role !== "OSP" && <div className="font-normal text-gray-500 text-xs mt-1">CID: {cp.patient.cid}</div>}
                  
                  {/* Show Target Groups */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {cp.patient.isGroup1A && <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700 ring-1 ring-inset ring-red-600/10">1A: ภาวะพึ่งพิง</span>}
                    {cp.patient.isGroup1B && <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-0.5 text-[10px] font-medium text-orange-700 ring-1 ring-inset ring-orange-600/10">1B: Palliative</span>}
                    {cp.patient.isGroup2 && <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 ring-1 ring-inset ring-blue-600/10">2: NCDs</span>}
                    {cp.patient.isGroup3 && <span className="inline-flex items-center rounded-md bg-pink-50 px-2 py-0.5 text-[10px] font-medium text-pink-700 ring-1 ring-inset ring-pink-600/10">3: แม่และเด็ก</span>}
                    {cp.patient.isGroup4 && <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700 ring-1 ring-inset ring-purple-600/10">4: จิตเวช</span>}
                  </div>
                  {role === "OSP" && cp.patient.gpsLat && cp.patient.gpsLng && (
                    <div className="mt-2">
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${cp.patient.gpsLat},${cp.patient.gpsLng}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded border border-blue-200 hover:bg-blue-100 transition-colors"
                      >
                        <MapPin size={12} /> นำทางด้วย Google Maps
                      </a>
                    </div>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{cp.assignedTo.name}</td>
                <td className="whitespace-normal px-3 py-4 text-sm text-gray-500 max-w-xs truncate" title={cp.goals}>
                  {cp.goals || "-"}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    cp.status === 'PENDING' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' :
                    cp.status === 'APPROVED' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                    'bg-red-50 text-red-700 ring-red-600/10'
                  }`}>
                    {cp.status === 'PENDING' ? 'รอดำเนินการ' : cp.status === 'APPROVED' ? 'อนุมัติแล้ว' : 'ปฏิเสธ'}
                  </span>
                  {cp.approvedBy && (
                    <div className="mt-1 text-[10px] text-gray-400 leading-tight">
                      ดป.: {cp.approvedBy.name}<br/>
                      {cp.approvedAt ? new Date(cp.approvedAt).toLocaleString('th-TH') : ''}
                    </div>
                  )}
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  {(role === "ADMIN" || role === "SSO") && cp.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(cp.id, "APPROVED")}
                        disabled={isProcessing === cp.id}
                        className="text-green-600 hover:text-green-900 mr-4 disabled:opacity-50"
                        title="อนุมัติแผน"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button
                        onClick={() => handleStatusChange(cp.id, "REJECTED")}
                        disabled={isProcessing === cp.id}
                        className="text-orange-600 hover:text-orange-900 mr-4 disabled:opacity-50"
                        title="ปฏิเสธแผน"
                      >
                        <XCircle size={18} />
                      </button>
                    </>
                  )}
                  {(role === "ADMIN" || role === "RH_ST") && (
                    <button
                      onClick={() => handleDelete(cp.id)}
                      disabled={isProcessing === cp.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {carePlans.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500 text-sm">
                  ไม่มีข้อมูลแผนการดูแล
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <CarePlanFormModal onClose={() => setIsModalOpen(false)} patients={patients} osps={osps} />
      )}
    </div>
  );
}
