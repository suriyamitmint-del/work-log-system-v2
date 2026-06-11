"use client";

import { useState } from "react";
import { deletePatient } from "./actions";
import PatientFormModal from "./PatientFormModal";
import PatientEditModal from "./PatientEditModal";
import { PlusCircle, Trash2, UserCircle, Edit } from "lucide-react";

export default function PatientTable({ patients, areas }: { patients: any[], areas: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลผู้รับบริการรายนี้?")) {
      setIsDeleting(id);
      await deletePatient(id);
      setIsDeleting(null);
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <PlusCircle size={18} />
          เพิ่มผู้รับบริการ
        </button>
      </div>

      <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                เลขบัตรประชาชน (CID)
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                ชื่อ-นามสกุล
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                กลุ่มเป้าหมาย
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                พื้นที่
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {patients.map((patient) => (
              <tr key={patient.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {patient.cid}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {patient.prefix ? `${patient.prefix}${patient.name}` : patient.name}
                </td>
                <td className="whitespace-normal px-3 py-4 text-sm text-gray-500">
                  <div className="flex flex-wrap gap-1">
                    {patient.isGroup1A && <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">1A: ภาวะพึ่งพิง</span>}
                    {patient.isGroup1B && <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-600/10">1B: Palliative</span>}
                    {patient.isGroup2 && <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">2: NCDs</span>}
                    {patient.isGroup3 && <span className="inline-flex items-center rounded-md bg-pink-50 px-2 py-1 text-xs font-medium text-pink-700 ring-1 ring-inset ring-pink-600/10">3: แม่และเด็ก</span>}
                    {patient.isGroup4 && <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-600/10">4: จิตเวช</span>}
                  </div>
                </td>
                <td className="whitespace-normal px-3 py-4 text-sm text-gray-500 max-w-xs">
                  {patient.area ? `${patient.area.subDistrict} อ.${patient.area.district} จ.${patient.area.province} (${patient.area.zipCode})` : "-"}
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <button className="text-blue-600 hover:text-blue-900 ml-4" title="ดูข้อมูล">
                    <UserCircle size={18} />
                  </button>
                  <button 
                    onClick={() => setEditingPatient(patient)}
                    className="text-indigo-600 hover:text-indigo-900 ml-4" 
                    title="แก้ไขข้อมูล"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(patient.id)}
                    disabled={isDeleting === patient.id}
                    className="text-red-600 hover:text-red-900 ml-4 disabled:opacity-50"
                    title="ลบข้อมูล"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {patients.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500 text-sm">
                  ไม่มีข้อมูลผู้รับบริการ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <PatientFormModal onClose={() => setIsModalOpen(false)} areas={areas} />
      )}

      {editingPatient && (
        <PatientEditModal 
          patient={editingPatient} 
          onClose={() => setEditingPatient(null)} 
          areas={areas} 
        />
      )}
    </div>
  );
}
