"use client";

import { useState, useEffect } from "react";
import { createCarePlan } from "./actions";
import { MODULE_A, MODULE_B, MODULE_C, MODULE_D, MODULE_COMMON } from "@/lib/constants";

export default function CarePlanFormModal({ onClose, patients, osps }: { onClose: () => void, patients: any[], osps: any[] }) {
  const [formData, setFormData] = useState({
    patientId: patients.length > 0 ? patients[0].id : "",
    assignedToId: osps.length > 0 ? osps[0].id : "",
    goals: "",
    activityPlan: "",
  });
  
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedPatient = patients.find(p => p.id === formData.patientId);

  // Initialize selected activities when patient changes
  useEffect(() => {
    if (!selectedPatient) return;
    
    let defaultActivities: string[] = [];
    if (selectedPatient.isGroup1A || selectedPatient.isGroup1B) {
      defaultActivities = [...defaultActivities, ...MODULE_A.map(a => a.id)];
    }
    if (selectedPatient.isGroup2) {
      defaultActivities = [...defaultActivities, ...MODULE_B.map(a => a.id)];
    }
    if (selectedPatient.isGroup3) {
      defaultActivities = [...defaultActivities, ...MODULE_C.map(a => a.id)];
    }
    if (selectedPatient.isGroup4) {
      defaultActivities = [...defaultActivities, ...MODULE_D.map(a => a.id)];
    }
    defaultActivities = [...defaultActivities, ...MODULE_COMMON.map(a => a.id)];
    
    setSelectedActivities(defaultActivities);
  }, [formData.patientId, selectedPatient]);

  const toggleActivity = (id: string) => {
    setSelectedActivities(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.patientId || !formData.assignedToId) {
      setError("กรุณาเลือกผู้รับบริการและผู้รับผิดชอบ");
      setLoading(false);
      return;
    }
    
    const finalData = {
      ...formData,
      activityPlan: JSON.stringify(selectedActivities)
    };

    const result = await createCarePlan(finalData);
    
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      onClose();
    }
  };

  const renderModule = (title: string, moduleItems: any[], bgColor: string, textColor: string) => (
    <div className={`mb-4 p-3 rounded-xl ${bgColor} border`} style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
      <h4 className={`font-semibold mb-2 ${textColor}`}>{title}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {moduleItems.map(item => (
          <label key={item.id} className="flex items-start gap-2 text-sm cursor-pointer hover:bg-white/50 p-1 rounded">
            <input 
              type="checkbox" 
              className="mt-1"
              checked={selectedActivities.includes(item.id)}
              onChange={() => toggleActivity(item.id)}
            />
            <span>{item.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] overflow-y-auto p-4 sm:p-6">
      <div className="bg-white p-6 rounded-2xl w-full max-w-3xl text-black shadow-xl my-8">
        <h3 className="text-xl font-bold mb-4">จ่ายงาน (สร้างแผนการดูแล)</h3>
        
        {error && <div className="text-red-500 mb-4 text-sm bg-red-50 p-2 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium">ผู้รับบริการ (Patient)</label>
              <select
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              >
                {patients.length === 0 && <option value="">ไม่มีข้อมูลผู้รับบริการ</option>}
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (CID: {p.cid})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">มอบหมายให้ อสพ.</label>
              <select
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                value={formData.assignedToId}
                onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
              >
                {osps.length === 0 && <option value="">ไม่พบข้อมูล อสพ.</option>}
                {osps.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">เป้าหมายการดูแล (Goals)</label>
            <textarea
              rows={2}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              placeholder="เช่น ลดระดับความดันโลหิต, ติดตามการทานยา..."
            />
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium">แผนกิจกรรม (Activity Plan)</label>
            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-gray-50">
              {selectedPatient ? (
                <>
                  <p className="text-xs text-gray-500 mb-3">* ระบบเลือกกิจกรรมแนะนำตามกลุ่มเป้าหมายให้เป็นค่าเริ่มต้น สามารถปรับเปลี่ยนได้</p>
                  
                  {(selectedPatient.isGroup1A || selectedPatient.isGroup1B) && 
                    renderModule("กลุ่ม 1: ภาวะพึ่งพิง / Palliative", MODULE_A, "bg-red-50", "text-red-800")}
                    
                  {selectedPatient.isGroup2 && 
                    renderModule("กลุ่ม 2: โรค NCDs", MODULE_B, "bg-blue-50", "text-blue-800")}
                    
                  {selectedPatient.isGroup3 && 
                    renderModule("กลุ่ม 3: แม่และเด็ก", MODULE_C, "bg-pink-50", "text-pink-800")}
                    
                  {selectedPatient.isGroup4 && 
                    renderModule("กลุ่ม 4: จิตเวช/ยาเสพติด", MODULE_D, "bg-purple-50", "text-purple-800")}
                  
                  {renderModule("กิจกรรมพื้นฐาน (Common)", MODULE_COMMON, "bg-gray-100", "text-gray-800")}
                </>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">กรุณาเลือกผู้รับบริการเพื่อแสดงแผนกิจกรรม</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors rounded-full">
              ยกเลิก
            </button>
            <button type="submit" disabled={loading || patients.length === 0 || osps.length === 0} className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors rounded-full">
              {loading ? "กำลังบันทึก..." : "สร้างแผนและจ่ายงาน"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
