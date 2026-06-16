"use client";

import { useState } from "react";
import { deleteUser } from "./actions";
import UserFormModal from "./UserFormModal";
import UserEditAreaModal from "./UserEditAreaModal";
import { PlusCircle, Trash2, MapPin, Edit } from "lucide-react";

export default function UserTable({ users, areas }: { users: any[], areas: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null); // For area edit
  const [editingFullUser, setEditingFullUser] = useState<any>(null); // For full user edit
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState("ALL");

  const handleDelete = async (id: string) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งานนี้?")) {
      setIsDeleting(id);
      await deleteUser(id);
      setIsDeleting(null);
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <label htmlFor="role-filter" className="text-sm font-medium text-gray-700">
            กรองตามสิทธิ์:
          </label>
          <select
            id="role-filter"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
          >
            <option value="ALL">ทั้งหมด (All Roles)</option>
            <option value="OSP">อาสาพยาบาลชุมชน (OSP)</option>
            <option value="RH_ST">รพ.สต. (RH_ST)</option>
            <option value="SSO">สสอ. (SSO)</option>
            <option value="SSJ">สสจ. (SSJ)</option>
            <option value="SBS">กรม สบส. (SBS)</option>
            <option value="ADMIN">ผู้ดูแลระบบ (ADMIN)</option>
          </select>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <PlusCircle size={18} />
          เพิ่มผู้ใช้งาน
        </button>
      </div>

      <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 sm:rounded-xl">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                ชื่อ-นามสกุล (Name)
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Username
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                สิทธิ์ (Role)
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                พื้นที่รับผิดชอบ (Area)
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {(filterRole === "ALL" ? users : users.filter(u => u.role === filterRole)).map((user) => (
              <tr key={user.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {user.name}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.username}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <span className={`inline-flex items-center rounded-xl px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    user.role === 'ADMIN' ? 'bg-red-50 text-red-700 ring-red-600/10' :
                    user.role === 'OSP' ? 'bg-green-50 text-green-700 ring-green-600/10' :
                    user.role === 'RH_ST' ? 'bg-blue-50 text-blue-700 ring-blue-600/10' :
                    user.role === 'SSO' ? 'bg-indigo-50 text-indigo-700 ring-indigo-600/10' :
                    'bg-gray-50 text-gray-700 ring-gray-600/10'
                  }`}>
                    {user.role === 'ADMIN' ? 'Admin' : 
                     user.role === 'OSP' ? 'อสพ.' : 
                    user.role === 'RH_ST' ? 'รพ.สต.' : 
                    user.role === 'SSO' ? 'สสอ.' :
                     user.role === 'SSJ' ? 'สสจ.' : 
                     user.role === 'SBS' ? 'กรม สบส.' : user.role}
                  </span>
                </td>
                <td className="whitespace-normal px-3 py-4 text-sm text-gray-500 max-w-xs">
                  {user.area ? (
                    user.role === 'SSJ' ? `จ.${user.area.province}` :
                    user.role === 'SSO' ? `อ.${user.area.district} จ.${user.area.province}` :
                    `ต.${user.area.subDistrict} อ.${user.area.district} จ.${user.area.province}`
                  ) : "-"}
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  {user.role !== 'ADMIN' && (
                    <>
                      <button
                        onClick={() => setEditingFullUser(user)}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                        title="แก้ไขข้อมูลผู้ใช้งาน"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setEditingUser(user)}
                        className="text-indigo-600 hover:text-indigo-900 ml-4 disabled:opacity-50"
                        title="แก้ไขพื้นที่รับผิดชอบ"
                      >
                        <MapPin size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={isDeleting === user.id}
                        className="text-red-600 hover:text-red-900 ml-4 disabled:opacity-50"
                        title="ลบผู้ใช้งาน"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {(filterRole === "ALL" ? users : users.filter(u => u.role === filterRole)).length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500 text-sm">
                  ไม่มีข้อมูลผู้ใช้งานที่ตรงกับเงื่อนไข
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <UserFormModal onClose={() => setIsModalOpen(false)} areas={areas} />
      )}
      
      {editingFullUser && (
        <UserFormModal 
          onClose={() => setEditingFullUser(null)} 
          areas={areas} 
          userToEdit={editingFullUser} 
        />
      )}
      
      {editingUser && (
        <UserEditAreaModal 
          user={editingUser} 
          onClose={() => setEditingUser(null)} 
          areas={areas} 
        />
      )}
    </div>
  );
}
