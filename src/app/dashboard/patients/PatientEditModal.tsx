"use client";

import { useState, useMemo, useEffect } from "react";
import { updatePatient } from "./actions";

export default function PatientEditModal({ patient, onClose, areas }: { patient: any, onClose: () => void, areas: any[] }) {
  const currentYearBE = new Date().getFullYear() + 543;
  const yearsBE = Array.from({ length: 120 }, (_, i) => currentYearBE - i);
  const months = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // Parse existing DOB to Thai date format
  let initialDay = "";
  let initialMonth = "";
  let initialYear = "";
  if (patient.dob) {
    try {
      const dateStr = patient.dob.split('T')[0];
      const [year, month, day] = dateStr.split('-');
      initialYear = (parseInt(year) + 543).toString();
      initialMonth = months[parseInt(month) - 1] || "";
      initialDay = parseInt(day).toString();
    } catch (e) {
      console.error("Error parsing DOB:", e);
    }
  }

  const commonPrefixes = ["นาย", "นาง", "นางสาว", "ด.ช.", "ด.ญ.", "พระ", ""];
  const isCustomPrefix = patient.prefix && !commonPrefixes.includes(patient.prefix);

  const [formData, setFormData] = useState({
    hn: patient.hn || "",
    cid: patient.cid || "",
    prefixSelect: isCustomPrefix ? "อื่นๆ" : (patient.prefix || ""),
    customPrefix: isCustomPrefix ? patient.prefix : "",
    name: patient.name || "",
    gender: patient.gender || "ชาย",
    insurance: patient.insurance || "",
    address: patient.address || "",
    phone: patient.phone || "",
    lineId: patient.lineId || "",
    caregiverName: patient.caregiverName || "",
    caregiverRelation: patient.caregiverRelation || "",
    caregiverPhone: patient.caregiverPhone || "",
    distanceFromHospital: patient.distanceFromHospital ? patient.distanceFromHospital.toString() : "",
    gpsLat: patient.gpsLat || "",
    gpsLng: patient.gpsLng || "",
    isGroup1A: patient.isGroup1A || false,
    isGroup1B: patient.isGroup1B || false,
    isGroup2: patient.isGroup2 || false,
    isGroup3: patient.isGroup3 || false,
    isGroup4: patient.isGroup4 || false,
    areaId: patient.areaId || "",
  });
  
  const [bDay, setBDay] = useState(initialDay);
  const [bMonth, setBMonth] = useState(initialMonth);
  const [bYear, setBYear] = useState(initialYear);

  const [selectedProvince, setSelectedProvince] = useState(patient.area?.province || "");
  const [selectedDistrict, setSelectedDistrict] = useState(patient.area?.district || "");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Unique lists for dropdowns
  const provinces = useMemo(() => Array.from(new Set(areas.map(a => a.province))), [areas]);
  
  const districts = useMemo(() => {
    if (!selectedProvince) return [];
    return Array.from(new Set(areas.filter(a => a.province === selectedProvince).map(a => a.district)));
  }, [selectedProvince, areas]);
  
  const subDistricts = useMemo(() => {
    if (!selectedProvince || !selectedDistrict) return [];
    return areas.filter(a => a.province === selectedProvince && a.district === selectedDistrict);
  }, [selectedProvince, selectedDistrict, areas]);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            gpsLat: position.coords.latitude.toString(),
            gpsLng: position.coords.longitude.toString()
          }));
        },
        (error) => {
          alert("ไม่สามารถดึงข้อมูลพิกัดได้: " + error.message);
        }
      );
    } else {
      alert("เบราว์เซอร์ของคุณไม่รองรับการดึงพิกัด GPS");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.areaId) {
      setError("กรุณาระบุพื้นที่ (ตำบล/รหัสไปรษณีย์)");
      setLoading(false);
      return;
    }

    if (!bDay || !bMonth || !bYear) {
      setError("กรุณาระบุวัน/เดือน/ปีเกิดให้ครบถ้วน");
      setLoading(false);
      return;
    }

    // Convert B.E. Date to Date string (YYYY-MM-DD)
    const monthIndex = months.indexOf(bMonth);
    const yearAD = parseInt(bYear) - 543;
    const dobString = `${yearAD}-${String(monthIndex + 1).padStart(2, '0')}-${String(bDay).padStart(2, '0')}`;

    const finalPrefix = formData.prefixSelect === "อื่นๆ" ? formData.customPrefix : formData.prefixSelect;

    if (!finalPrefix) {
      setError("กรุณาระบุคำนำหน้าชื่อ");
      setLoading(false);
      return;
    }

    const payload = {
      ...formData,
      prefix: finalPrefix,
      dob: dobString,
      areaId: formData.areaId
    };

    const result = await updatePatient(patient.id, payload);
    
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      onClose();
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflowY: 'auto', padding: '20px' }}>
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', width: '100%', maxWidth: '800px', color: 'black', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>แก้ไขข้อมูลผู้รับบริการ (CP-CNV-01)</h3>
        
        {error && <div style={{ color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#fee2e2', borderRadius: '4px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            {/* Section 1: CID & HN */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>เลขบัตรประชาชน (CID) *</label>
              <input type="text" required maxLength={13} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#f3f4f6' }} value={formData.cid} disabled />
              <small style={{ color: '#666' }}>ไม่สามารถแก้ไข CID ได้</small>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>HN (รพ.)</label>
              <input type="text" style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} value={formData.hn} onChange={(e) => setFormData({ ...formData, hn: e.target.value })} />
            </div>

            {/* Section 2: Name */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>คำนำหน้า *</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select required style={{ width: formData.prefixSelect === 'อื่นๆ' ? '120px' : '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} value={formData.prefixSelect} onChange={(e) => setFormData({ ...formData, prefixSelect: e.target.value })}>
                  <option value="">- เลือก -</option>
                  <option value="นาย">นาย</option>
                  <option value="นาง">นาง</option>
                  <option value="นางสาว">นางสาว</option>
                  <option value="ด.ช.">ด.ช.</option>
                  <option value="ด.ญ.">ด.ญ.</option>
                  <option value="พระ">พระ</option>
                  <option value="อื่นๆ">อื่นๆ (ระบุ)</option>
                </select>
                {formData.prefixSelect === 'อื่นๆ' && (
                  <input type="text" required style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} placeholder="ระบุคำนำหน้า" value={formData.customPrefix} onChange={(e) => setFormData({ ...formData, customPrefix: e.target.value })} />
                )}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>ชื่อ-นามสกุล *</label>
              <input type="text" required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>

            {/* Section 3: DOB & Gender */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>วัน/เดือน/ปีเกิด (พ.ศ.) *</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select required style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} value={bDay} onChange={(e) => setBDay(e.target.value)}>
                  <option value="">- วัน -</option>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select required style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} value={bMonth} onChange={(e) => setBMonth(e.target.value)}>
                  <option value="">- เดือน -</option>
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select required style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} value={bYear} onChange={(e) => setBYear(e.target.value)}>
                  <option value="">- ปี พ.ศ. -</option>
                  {yearsBE.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>เพศ *</label>
              <select style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                <option value="ชาย">ชาย</option>
                <option value="หญิง">หญิง</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>สิทธิการรักษา *</label>
              <select required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} value={formData.insurance} onChange={(e) => setFormData({ ...formData, insurance: e.target.value })}>
                <option value="">- เลือกสิทธิ -</option>
                <option value="บัตรทอง (UC)">บัตรทอง (UC)</option>
                <option value="ข้าราชการ (CSMBS)">ข้าราชการ (CSMBS)</option>
                <option value="ประกันสังคม (SSS)">ประกันสังคม (SSS)</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>

            {/* Section 4: Contact */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>ที่อยู่ปัจจุบัน (บ้านเลขที่ หมู่ ถนน) *</label>
              <textarea required rows={2} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>เบอร์โทรศัพท์ผู้รับบริการ</label>
              <input type="text" style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>LINE ID</label>
              <input type="text" style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} value={formData.lineId} onChange={(e) => setFormData({ ...formData, lineId: e.target.value })} />
            </div>

            {/* Section 5: Caregiver */}
            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #eee', paddingTop: '16px' }}>
              <h4 style={{ fontWeight: 'bold', marginBottom: '10px' }}>ข้อมูลผู้ดูแล (Primary Caregiver)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}>ชื่อ-นามสกุลผู้ดูแล</label>
                  <input type="text" style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} value={formData.caregiverName} onChange={(e) => setFormData({ ...formData, caregiverName: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}>ความสัมพันธ์</label>
                  <input type="text" style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} value={formData.caregiverRelation} onChange={(e) => setFormData({ ...formData, caregiverRelation: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}>เบอร์โทรศัพท์ผู้ดูแล</label>
                  <input type="text" style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} value={formData.caregiverPhone} onChange={(e) => setFormData({ ...formData, caregiverPhone: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Section 6: Area & Location */}
            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #eee', paddingTop: '16px' }}>
              <h4 style={{ fontWeight: 'bold', marginBottom: '10px' }}>พื้นที่และพิกัด *</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}>จังหวัด *</label>
                  <select required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} value={selectedProvince} onChange={(e) => { setSelectedProvince(e.target.value); setSelectedDistrict(""); setFormData(prev => ({ ...prev, areaId: "" })); }}>
                    <option value="">- เลือกจังหวัด -</option>
                    {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}>อำเภอ *</label>
                  <select required disabled={!selectedProvince} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} value={selectedDistrict} onChange={(e) => { setSelectedDistrict(e.target.value); setFormData(prev => ({ ...prev, areaId: "" })); }}>
                    <option value="">- เลือกอำเภอ -</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}>ตำบล (รหัสไปรษณีย์) *</label>
                  <select required disabled={!selectedDistrict} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} value={formData.areaId} onChange={(e) => setFormData({ ...formData, areaId: e.target.value })}>
                    <option value="">- เลือกตำบล -</option>
                    {subDistricts.map(sd => (
                      <option key={sd.id} value={sd.id}>ต.{sd.subDistrict} (ปณ. {sd.zipCode})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}>ระยะทางจาก รพ.สต. (กม.)</label>
                  <input type="number" step="0.1" style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} value={formData.distanceFromHospital} onChange={(e) => setFormData({ ...formData, distanceFromHospital: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', marginTop: '10px', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}>ละติจูด (Latitude)</label>
                  <input type="text" style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#f9fafb' }} value={formData.gpsLat} onChange={(e) => setFormData({ ...formData, gpsLat: e.target.value })} placeholder="เช่น 13.7563" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}>ลองจิจูด (Longitude)</label>
                  <input type="text" style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#f9fafb' }} value={formData.gpsLng} onChange={(e) => setFormData({ ...formData, gpsLng: e.target.value })} placeholder="เช่น 100.5018" />
                </div>
                <div>
                  <button type="button" onClick={handleGetLocation} style={{ padding: '8px 12px', backgroundColor: '#4b5563', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', height: '40px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    ดึงพิกัดปัจจุบัน
                  </button>
                </div>
              </div>
            </div>
            
            {/* Section 7: Target Groups */}
            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #eee', paddingTop: '16px', marginTop: '8px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', paddingBottom: '5px' }}>กลุ่มเป้าหมาย (เลือกได้มากกว่า 1)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input type="checkbox" checked={formData.isGroup1A} onChange={(e) => setFormData({...formData, isGroup1A: e.target.checked})} style={{ marginRight: '8px' }} />
                  <span>กลุ่ม 1A (ภาวะพึ่งพิง)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input type="checkbox" checked={formData.isGroup1B} onChange={(e) => setFormData({...formData, isGroup1B: e.target.checked})} style={{ marginRight: '8px' }} />
                  <span>กลุ่ม 1B (Palliative)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input type="checkbox" checked={formData.isGroup2} onChange={(e) => setFormData({...formData, isGroup2: e.target.checked})} style={{ marginRight: '8px' }} />
                  <span>กลุ่ม 2 (NCDs)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input type="checkbox" checked={formData.isGroup3} onChange={(e) => setFormData({...formData, isGroup3: e.target.checked})} style={{ marginRight: '8px' }} />
                  <span>กลุ่ม 3 (แม่และเด็ก)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input type="checkbox" checked={formData.isGroup4} onChange={(e) => setFormData({...formData, isGroup4: e.target.checked})} style={{ marginRight: '8px' }} />
                  <span>กลุ่ม 4 (จิตเวช/ยาเสพติด)</span>
                </label>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'white', color: 'black' }}>
              ยกเลิก
            </button>
            <button type="submit" disabled={loading} style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
