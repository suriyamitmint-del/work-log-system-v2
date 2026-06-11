"use client";

import { useState, useMemo, useEffect } from "react";
import { updateUserAreaByData } from "./actions";
import { HEALTH_REGIONS, getHealthRegionByProvince } from "@/lib/healthRegions";

export default function UserEditAreaModal({ user, onClose, areas }: { user: any, onClose: () => void, areas: any[] }) {
  const [selectedProvince, setSelectedProvince] = useState(user.area?.province || "");
  const [selectedRegion, setSelectedRegion] = useState(() => {
    if (user.area?.province) {
      return getHealthRegionByProvince(user.area.province) || "";
    }
    return "";
  });
  const [selectedDistrict, setSelectedDistrict] = useState(user.area?.district || "");
  const [selectedSubDistrict, setSelectedSubDistrict] = useState(user.area?.subDistrict || "");
  const [selectedZipCode, setSelectedZipCode] = useState(user.area?.zipCode || "");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [thaiData, setThaiData] = useState<any[]>([]);

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

    if ((user.role === "OSP" || user.role === "RH_ST") && !selectedSubDistrict) {
      setError("กรุณาระบุพื้นที่รับผิดชอบ (ตำบล/รหัสไปรษณีย์)");
      setLoading(false);
      return;
    } else if (user.role === "SSO" && !selectedDistrict) {
      setError("กรุณาระบุอำเภอที่รับผิดชอบ");
      setLoading(false);
      return;
    } else if (user.role === "SSJ" && !selectedProvince) {
      setError("กรุณาระบุจังหวัดที่รับผิดชอบ");
      setLoading(false);
      return;
    }

    const result = await updateUserAreaByData(user.id, selectedProvince, selectedDistrict, selectedSubDistrict, selectedZipCode, user.role);
    
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      onClose();
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', width: '100%', maxWidth: '500px', color: 'black' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: 'bold' }}>
          แก้ไขพื้นที่รับผิดชอบของ {user.name} ({user.role})
        </h3>
        
        {error && <div style={{ color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#fee2e2', borderRadius: '4px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
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

          <div style={{ marginBottom: '16px' }}>
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
          
          {user.role !== 'SSJ' && (
            <>
              <div style={{ marginBottom: '16px' }}>
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
              
              {user.role !== 'SSO' && (
                <div style={{ marginBottom: '16px' }}>
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'white', color: 'black' }}>
              ยกเลิก
            </button>
            <button type="submit" disabled={loading} style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              {loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
