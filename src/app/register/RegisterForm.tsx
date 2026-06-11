"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { submitRegistration } from "./actions";
import { HEALTH_REGIONS, getHealthRegionByProvince } from "@/lib/healthRegions";

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "OSP",
  });

  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSubDistrict, setSelectedSubDistrict] = useState("");
  const [selectedZipCode, setSelectedZipCode] = useState("");

  const [thaiData, setThaiData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/data/thai_geography_2569.json')
      .then(res => res.json())
      .then(data => setThaiData(data))
      .catch(err => console.error("Failed to load Thai geographic data", err));
  }, []);

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

    const payload = {
      ...formData,
      region: selectedRegion,
      province: selectedProvince,
      district: selectedDistrict,
      subDistrict: selectedSubDistrict,
      zipCode: selectedZipCode
    };

    const result = await submitRegistration(payload);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <h3 className="text-xl font-bold text-green-600 mb-4">ลงทะเบียนสำเร็จ!</h3>
        <p className="text-gray-600 mb-6">
          ระบบได้รับข้อมูลของคุณเรียบร้อยแล้ว บัญชีจะยังไม่สามารถใช้งานได้จนกว่าผู้ดูแลระบบ (Admin) จะกดยืนยันอนุมัติ
        </p>
        <Link href="/login" className="text-indigo-600 font-medium hover:underline">
          กลับไปหน้าเข้าสู่ระบบ
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">ชื่อ-นามสกุล *</label>
          <input
            type="text"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Username *</label>
          <input
            type="text"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Password *</label>
          <input
            type="password"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">สิทธิ์การใช้งาน (Role) *</label>
          <select
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 text-black"
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
          </select>
        </div>

        {(formData.role === 'OSP' || formData.role === 'RH_ST' || formData.role === 'SSO' || formData.role === 'SSJ') && (
          <div className="sm:col-span-2 border-t border-gray-200 pt-4 mt-2">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">กำหนดพื้นที่รับผิดชอบ</h4>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">เขตสุขภาพ</label>
                <select
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
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

              <div>
                <label className="block text-sm font-medium text-gray-700">จังหวัด</label>
                <select
                  disabled={!selectedRegion && provinces.length === 0}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black disabled:bg-gray-100"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">อำเภอ</label>
                  <select
                    disabled={!selectedProvince}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black disabled:bg-gray-100"
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
              )}

              {(formData.role === 'OSP' || formData.role === 'RH_ST') && (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">ตำบล (รหัสไปรษณีย์)</label>
                  <select
                    disabled={!selectedDistrict}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black disabled:bg-gray-100"
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
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 flex items-center justify-between">
        <div className="text-sm">
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            กลับหน้าเข้าสู่ระบบ
          </Link>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? "กำลังส่งข้อมูล..." : "ลงทะเบียน"}
        </button>
      </div>
    </form>
  );
}
