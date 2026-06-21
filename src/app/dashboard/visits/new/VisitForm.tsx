"use client";

import { useState } from "react";
import { createVisit } from "../actions";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import { MODULE_A, MODULE_B, MODULE_C, MODULE_D, MODULE_COMMON } from "@/lib/constants";

const ALL_ACTIVITIES = [...MODULE_A, ...MODULE_B, ...MODULE_C, ...MODULE_D, ...MODULE_COMMON];

export default function VisitForm({ activePlans }: { activePlans: any[] }) {
  const router = useRouter();
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    bloodPressure: "",
    bloodSugar: "",
    weight: "",
    height: "",
    temperature: "",
    pulse: "",
    adlScore: "",
    q2Score: "",
    q9Score: "",
    st5Score: "",
    notes: "",
  });

  const [activityResults, setActivityResults] = useState<Record<string, boolean>>({});
  
  // GPS & Image state
  const [gpsLat, setGpsLat] = useState<string | null>(null);
  const [gpsLng, setGpsLng] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  const selectedPlan = activePlans.find(p => p.id === selectedPlanId);
  const patient = selectedPlan?.patient;

  let assignedActivityIds: string[] = [];
  if (selectedPlan?.activityPlan) {
    try {
      assignedActivityIds = JSON.parse(selectedPlan.activityPlan);
    } catch (e) {
      console.error("Failed to parse activityPlan");
    }
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("เบราว์เซอร์ของคุณไม่รองรับการขอพิกัด GPS");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLat(position.coords.latitude.toString());
        setGpsLng(position.coords.longitude.toString());
        setGpsLoading(false);
      },
      (error) => {
        alert("ไม่สามารถดึงตำแหน่ง GPS ได้ กรุณาอนุญาตให้เบราว์เซอร์เข้าถึงตำแหน่ง (Location Permission)");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      let file = e.target.files[0];
      
      // Image compression options
      const options = {
        maxSizeMB: 2,          // Compress to under 2MB
        maxWidthOrHeight: 1920,
        useWebWorker: true
      };

      try {
        const compressedFile = await imageCompression(file, options);
        // Browser returns a Blob, we convert it back to a File object for consistency
        const finalFile = new File([compressedFile], file.name, {
          type: compressedFile.type,
          lastModified: Date.now(),
        });
        
        setImageFile(finalFile);
        setImagePreview(URL.createObjectURL(finalFile));
      } catch (error) {
        console.error("Error compressing image:", error);
        alert("ไม่สามารถบีบอัดรูปภาพได้ จะใช้รูปภาพต้นฉบับแทน");
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent, submit: boolean) => {
    e.preventDefault();
    if (!selectedPlan || !patient) return;
    
    if (!gpsLat || !gpsLng) {
      alert("กรุณากดปุ่ม 'ขอตำแหน่งปัจจุบัน (GPS)' ก่อนบันทึกข้อมูล");
      return;
    }
    if (!imageFile) {
      alert("กรุณาแนบรูปถ่ายการเยี่ยมบ้าน 1 รูป");
      return;
    }

    setLoading(true);
    
    // Upload Image
    let uploadedImageUrl = "";
    try {
      const formDataObj = new FormData();
      formDataObj.append("file", imageFile);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formDataObj
      });
      const uploadData = await uploadRes.json();
      if (!uploadData.success) {
        alert("อัปโหลดรูปภาพไม่สำเร็จ: " + uploadData.error);
        setLoading(false);
        return;
      }
      uploadedImageUrl = uploadData.url;
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
      setLoading(false);
      return;
    }

    const result = await createVisit({
      ...formData,
      activityResults: JSON.stringify(activityResults),
      carePlanId: selectedPlan.id,
      patientId: patient.id,
      submit,
      gpsLat,
      gpsLng,
      imageUrl: uploadedImageUrl
    });

    setLoading(false);
    if (result.success) {
      router.push("/dashboard/visits");
    } else {
      alert(result.error);
    }
  };

  return (
    <form className="space-y-6 text-black">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">เลือกผู้รับบริการจากแผนการดูแล (Care Plan) ที่ได้รับมอบหมาย</label>
        <select
          className="w-full border border-gray-300 rounded-xl py-2 px-3 focus:ring-purple-500 focus:border-purple-500"
          value={selectedPlanId}
          onChange={(e) => {
            setSelectedPlanId(e.target.value);
            setActivityResults({}); // Reset on change
          }}
        >
          <option value="">-- กรุณาเลือก --</option>
          {activePlans.map(plan => (
            <option key={plan.id} value={plan.id}>
              {plan.patient.name} (เป้าหมาย: {plan.goals?.substring(0, 50)}...)
            </option>
          ))}
        </select>
      </div>

      {patient && (
        <div className="space-y-6">
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
            <h3 className="text-sm font-semibold text-yellow-900 mb-4">ข้อมูลจำเป็น (รูปถ่ายและพิกัด GPS)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">แนบรูปถ่ายการเยี่ยมบ้าน (จำกัด 1 รูป) *</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
                {imagePreview && (
                  <div className="mt-3">
                    <img src={imagePreview} alt="Preview" className="h-32 object-contain rounded border border-gray-200" />
                  </div>
                )}
              </div>
              
              {/* GPS */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">พิกัดสถานที่เยี่ยมบ้าน (GPS) *</label>
                <button 
                  type="button" 
                  onClick={handleGetLocation}
                  disabled={gpsLoading}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 text-sm font-medium transition-colors disabled:opacity-50 rounded-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  {gpsLoading ? "กำลังค้นหาตำแหน่ง..." : "ขอตำแหน่งปัจจุบัน (GPS)"}
                </button>
                {gpsLat && gpsLng && (
                  <div className="mt-3 text-sm text-green-700 bg-green-50 p-2 rounded border border-green-200 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    บันทึกพิกัดสำเร็จ ({Number(gpsLat).toFixed(5)}, {Number(gpsLng).toFixed(5)})
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">ข้อมูลเบื้องต้น (Vitals)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500">ความดันโลหิต (BP)</label>
                <input type="text" placeholder="120/80" className="mt-1 w-full border rounded-xl px-2 py-1 text-sm" 
                  value={formData.bloodPressure} onChange={e => setFormData({...formData, bloodPressure: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs text-gray-500">น้ำตาลในเลือด (mg/dL)</label>
                <input type="number" placeholder="90" className="mt-1 w-full border rounded-xl px-2 py-1 text-sm" 
                  value={formData.bloodSugar} onChange={e => setFormData({...formData, bloodSugar: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs text-gray-500">น้ำหนัก (กก.)</label>
                <input type="number" step="0.1" className="mt-1 w-full border rounded-xl px-2 py-1 text-sm" 
                  value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs text-gray-500">ส่วนสูง (ซม.)</label>
                <input type="number" step="0.1" className="mt-1 w-full border rounded-xl px-2 py-1 text-sm" 
                  value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs text-gray-500">อุณหภูมิ (°C)</label>
                <input type="number" step="0.1" className="mt-1 w-full border rounded-xl px-2 py-1 text-sm" 
                  value={formData.temperature} onChange={e => setFormData({...formData, temperature: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs text-gray-500">ชีพจร (ครั้ง/นาที)</label>
                <input type="number" className="mt-1 w-full border rounded-xl px-2 py-1 text-sm" 
                  value={formData.pulse} onChange={e => setFormData({...formData, pulse: e.target.value})} />
              </div>
            </div>
          </div>

          {/* Assigned Activities Checklist */}
          {assignedActivityIds.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 shadow-sm">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">กิจกรรมที่ได้รับมอบหมาย (ทำเครื่องหมายเมื่อปฏิบัติแล้ว)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {assignedActivityIds.map(id => {
                  const act = ALL_ACTIVITIES.find(a => a.id === id);
                  if (!act) return null;
                  return (
                    <label key={id} className="flex items-start gap-2 text-sm cursor-pointer hover:bg-white/50 p-1.5 rounded transition-colors">
                      <input 
                        type="checkbox" 
                        className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        checked={!!activityResults[id]}
                        onChange={(e) => setActivityResults({...activityResults, [id]: e.target.checked})}
                      />
                      <span className="text-blue-900">{act.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Group 1A/1B Logic */}
          {(patient.isGroup1A || patient.isGroup1B) && (
            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
              <h3 className="text-sm font-semibold text-red-900 mb-2">ประเมิน ADL (กลุ่มติดบ้านติดเตียง)</h3>
              <div>
                <label className="block text-xs text-gray-700">คะแนน ADL (0-20)</label>
                <input type="number" min="0" max="20" className="mt-1 w-24 border rounded-xl px-2 py-1 text-sm" 
                  value={formData.adlScore} onChange={e => setFormData({...formData, adlScore: e.target.value})} />
              </div>
            </div>
          )}

          {/* Group 4 Logic */}
          {patient.isGroup4 && (
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
              <h3 className="text-sm font-semibold text-purple-900 mb-2">ประเมินสุขภาพจิต (กลุ่มจิตเวช/ยาเสพติด)</h3>
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-xs text-gray-700">คะแนน 2Q</label>
                  <input type="number" className="mt-1 w-20 border rounded-xl px-2 py-1 text-sm" 
                    value={formData.q2Score} onChange={e => setFormData({...formData, q2Score: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs text-gray-700">คะแนน 9Q</label>
                  <input type="number" className="mt-1 w-20 border rounded-xl px-2 py-1 text-sm" 
                    value={formData.q9Score} onChange={e => setFormData({...formData, q9Score: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs text-gray-700">คะแนน ST-5</label>
                  <input type="number" className="mt-1 w-20 border rounded-xl px-2 py-1 text-sm" 
                    value={formData.st5Score} onChange={e => setFormData({...formData, st5Score: e.target.value})} />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">บันทึกเพิ่มเติมจากการเยี่ยมบ้าน</label>
            <textarea
              rows={4}
              className="mt-1 block w-full border border-gray-300 rounded-xl py-2 px-3 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="อาการทั่วไป, ปัญหาที่พบ, การให้คำแนะนำ..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50"
            >
              บันทึกฉบับร่าง
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-xl font-medium text-sm hover:bg-purple-700"
            >
              บันทึกและส่งให้ รพ.สต.
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
