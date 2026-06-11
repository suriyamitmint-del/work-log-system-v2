"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";

import { updateUser } from "./actions";
import { HEALTH_REGIONS, getHealthRegionByProvince } from "@/lib/healthRegions";

export default function UserFormModal({ onClose, areas, userToEdit }: { onClose: () => void, areas: any[], userToEdit?: any }) {
  const isEditing = !!userToEdit;
  const [formData, setFormData] = useState({
    name: userToEdit?.name || "",
    username: userToEdit?.username || "",
    password: "",
    role: userToEdit?.role || "OSP",
  });
  
  const [selectedProvince, setSelectedProvince] = useState(userToEdit?.area?.province || "");
  const [selectedRegion, setSelectedRegion] = useState(() => {
    if (userToEdit?.area?.province) {
      return getHealthRegionByProvince(userToEdit.area.province) || "";
    }
    return "";
  });
  const [selectedDistrict, setSelectedDistrict] = useState(userToEdit?.area?.district || "");
  const [selectedSubDistrict, setSelectedSubDistrict] = useState(userToEdit?.area?.subDistrict || "");
  const [selectedZipCode, setSelectedZipCode] = useState(userToEdit?.area?.zipCode || "");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [thaiData, setThaiData] = useState<any[]>([]);

  const router = useRouter();

  useEffect(() => {
    fetch('/data/thai_geography_2569.json')
      .then(res => res.json())
      .then(data => setThaiData(data))
      .catch(err => console.error("Failed to load Thai geographic data", err));
  }, []);
  // Derived lists from 2026 data
  const regions = Object.keys(HEALTH_REGIONS);

  const provinces = useMemo(() => {
    if (selectedRegion) {
      return HEALTH_REGIONS[selectedRegion] || [];
    }
    return thaiData.map(p => p.name_th).sort();
  }, [thaiData, selectedRegion]);
  
  const districts = useMemo(() => {
    if (!selectedProvince) return [];
    const prov = thaiData.find(p => p.name_th === selectedProvince);
    return prov ? prov.districts.map((d: any) => d.name_th).sort() : [];
  }, [selectedProvince, thaiData]);
  
  const subDistricts = useMemo(() => {
    if (!selectedProvince || !selectedDistrict) return [];
    const prov = thaiData.find(p => p.name_th === selectedProvince);
    if (!prov) return [];
    const dist = prov.districts.find((d: any) => d.name_th === selectedDistrict);
    return dist ? dist.sub_districts : [];
  }, [selectedProvince, selectedDistrict, thaiData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Area validation
    if (formData.role === "OSP" || formData.role === "RH_ST") {
      if (!selectedSubDistrict) {
        setError("กรุณาระบุพื้นที่รับผิดชอบ (ตำบล/รหัสไปรษณีย์)");
        setLoading(false);
        return;
      }
    } else if (formData.role === "SSO") {
      if (!selectedDistrict) {
        setError("กรุณาระบุอำเภอที่รับผิดชอบ");
        setLoading(false);
        return;
      }
    } else if (formData.role === "SSJ") {
      if (!selectedProvince) {
        setError("กรุณาระบุจังหวัดที่รับผิดชอบ");
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
        ...formData,
        province: selectedProvince,
        district: selectedDistrict,
        subDistrict: selectedSubDistrict,
        zipCode: selectedZipCode
      };

      let result;
      if (isEditing) {
        result = await updateUser(userToEdit.id, payload);
      } else {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        result = await res.json();
        if (!res.ok) result.error = result.error || "Failed to create user";
      }
      
      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else {
        router.refresh();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflowY: 'auto', padding: '20px' }}>
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', width: '100%', maxWidth: '500px', color: 'black', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: 'bold' }}>{isEditing ? "แก้ไขข้อมูลผู้ใช้งาน" : "เพิ่มผู้ใช้งานใหม่"}</h3>
        
        {error && <div style={{ color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#fee2e2', borderRadius: '4px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>ชื่อ-นามสกุล *</label>
              <input
                type="text"
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Username *</label>
              <input
                type="text"
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                {isEditing ? "ตั้งรหัสผ่านใหม่ (Reset Password)" : "Password *"}
              </label>
              <input
                type="text" // Change to text so admin can see what they are typing when resetting
                required={!isEditing}
                placeholder={isEditing ? "กรอกรหัสผ่านใหม่ (เว้นว่างไว้ถ้าไม่เปลี่ยน)" : ""}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              {isEditing && (
                <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  * ด้วยเหตุผลด้านความปลอดภัย ระบบจะไม่แสดงรหัสผ่านเดิม การกรอกช่องนี้จะเป็นการตั้งรหัสผ่านใหม่ทันที
                </p>
              )}
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>สิทธิ์การใช้งาน (Role) *</label>
              <select
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#f3f4f6' }}
                value={formData.role}
                onChange={(e) => {
                  setFormData({ ...formData, role: e.target.value });
                  if (e.target.value === 'ADMIN' || e.target.value === 'SBS') {
                     setSelectedRegion("");
                     setSelectedProvince("");
                     setSelectedDistrict("");
                     setSelectedSubDistrict("");
                     setSelectedZipCode("");
                  }
                }}
              >
                <option value="OSP">อาสาพยาบาลชุมชน (อสพ.)</option>
                <option value="RH_ST">รพ.สต. (RH_ST)</option>
                <option value="SSO">สสอ. (SSO)</option>
                <option value="SSJ">สำนักงานสาธารณสุขจังหวัด (สสจ.)</option>
                <option value="SBS">กรมสนับสนุนบริการสุขภาพ (กรม สบส.)</option>
                <option value="ADMIN">ผู้ดูแลระบบ (Admin)</option>
              </select>
            </div>
            
            {(formData.role === 'OSP' || formData.role === 'RH_ST' || formData.role === 'SSO' || formData.role === 'SSJ') && (
              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #eee', paddingTop: '16px', marginTop: '8px' }}>
                <h4 style={{ fontWeight: 'bold', marginBottom: '10px' }}>กำหนดพื้นที่รับผิดชอบ</h4>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>เขตสุขภาพ</label>
                  <select
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                    value={selectedRegion}
                    onChange={(e) => {
                      setSelectedRegion(e.target.value);
                      setSelectedProvince("");
                      setSelectedDistrict("");
                      setSelectedSubDistrict("");
                      setSelectedZipCode("");
                    }}
                  >
                    <option value="">-- เลือกเขตสุขภาพ --</option>
                    {regions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>จังหวัด</label>
                  <select
                    disabled={!selectedRegion && provinces.length === 0}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                    value={selectedProvince}
                    onChange={(e) => {
                      const prov = e.target.value;
                      setSelectedProvince(prov);
                      if (prov && !selectedRegion) {
                        const reg = getHealthRegionByProvince(prov);
                        if (reg) setSelectedRegion(reg);
                      }
                      setSelectedDistrict("");
                      setSelectedSubDistrict("");
                      setSelectedZipCode("");
                    }}
                  >
                    <option value="">-- เลือกจังหวัด --</option>
                    {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                
                {formData.role !== 'SSJ' && (
                  <>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', marginBottom: '5px' }}>อำเภอ</label>
                      <select
                        disabled={!selectedProvince}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                        value={selectedDistrict}
                        onChange={(e) => {
                          setSelectedDistrict(e.target.value);
                          setSelectedSubDistrict("");
                          setSelectedZipCode("");
                        }}
                      >
                        <option value="">-- เลือกอำเภอ --</option>
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    
                    {formData.role !== 'SSO' && (
                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>ตำบล (รหัสไปรษณีย์)</label>
                        <select
                          disabled={!selectedDistrict}
                          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                          value={selectedSubDistrict}
                          onChange={(e) => {
                            const subD = e.target.value;
                            setSelectedSubDistrict(subD);
                            const found = subDistricts.find((s: any) => s.name_th === subD);
                            if (found) setSelectedZipCode(found.zip_code);
                          }}
                        >
                          <option value="">-- เลือกตำบล --</option>
                          {subDistricts.map((sd: any) => (
                            <option key={sd.name_th} value={sd.name_th}>
                              ต.{sd.name_th} (ปณ. {sd.zip_code})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
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
