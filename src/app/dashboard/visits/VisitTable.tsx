"use client";

import { useState } from "react";
import { updateVisitStatus, bulkUpdateVisitStatus } from "./actions";
import { getHealthRegionByProvince } from "@/lib/healthRegions";
import Link from "next/link";
import { PlusCircle, CheckCircle, XCircle, Eye, Navigation } from "lucide-react";
import HomeVisitDetailModal from "./HomeVisitDetailModal";

export default function VisitTable({ visits, role }: { visits: any[], role: string }) {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [selectedVisit, setSelectedVisit] = useState<any | null>(null);
  const [filterArea, setFilterArea] = useState<string>("all");
  const [filterRegion, setFilterRegion] = useState<string>("all");
  const [selectedVisitIds, setSelectedVisitIds] = useState<string[]>([]);

  // Calculate unique areas based on role
  const uniqueRegions = Array.from(new Set(visits.map(v => {
    if (!v.createdBy?.area) return null;
    return getHealthRegionByProvince(v.createdBy.area.province);
  }).filter(Boolean))) as string[];

  const uniqueAreas = Array.from(new Set(visits.map(v => {
    if (!v.createdBy?.area) return null;
    if (role === "SSO") return v.createdBy.area.subDistrict;
    if (role === "SSJ") return v.createdBy.area.district;
    if (role === "SBS") return v.createdBy.area.province;
    return null;
  }).filter(Boolean))) as string[];

  const availableProvinces = uniqueAreas.filter(p => {
    if (role !== "SBS" || filterRegion === "all") return true;
    return getHealthRegionByProvince(p) === filterRegion;
  });

  // Filter visits
  const filteredVisits = visits.filter(v => {
    if (role === "SBS") {
      const province = v.createdBy?.area?.province;
      if (!province) return false;
      const region = getHealthRegionByProvince(province);
      if (filterRegion !== "all" && region !== filterRegion) return false;
      if (filterArea !== "all" && province !== filterArea) return false;
      return true;
    } else {
      if (filterArea === "all") return true;
      if (role === "SSO") return v.createdBy?.area?.subDistrict === filterArea;
      if (role === "SSJ") return v.createdBy?.area?.district === filterArea;
      return true;
    }
  });

  const canAction = (visit: any) => {
    if (role === "SSO" && visit.status === "APPROVED_BY_RH_ST") return true;
    if (role === "SSJ" && visit.status === "APPROVED_BY_SSO") return true;
    return false;
  };

  const actionableVisits = filteredVisits.filter(canAction);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedVisitIds(actionableVisits.map(v => v.id));
    } else {
      setSelectedVisitIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedVisitIds(prev => [...prev, id]);
    } else {
      setSelectedVisitIds(prev => prev.filter(vId => vId !== id));
    }
  };

  const handleBulkAction = async (status: string) => {
    if (selectedVisitIds.length === 0) return;
    setIsProcessing("bulk");
    await bulkUpdateVisitStatus(selectedVisitIds, status);
    setSelectedVisitIds([]);
    setIsProcessing(null);
  };

  const handleStatusChange = async (id: string, status: string) => {
    setIsProcessing(id);
    await updateVisitStatus(id, status);
    setIsProcessing(null);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'DRAFT': return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">ร่าง (Draft)</span>;
      case 'SUBMITTED_TO_RH_ST': return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">รอตรวจสอบ (รพ.สต.)</span>;
      case 'APPROVED_BY_RH_ST': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">รพ.สต. อนุมัติแล้ว</span>;
      case 'APPROVED_BY_SSO': return <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-medium">สสอ. ยืนยันแล้ว</span>;
      case 'APPROVED_BY_SSJ': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">สสจ. อนุมัติแล้ว</span>;
      default: return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2 items-center flex-wrap">
          {role === "SBS" && (
            <select
              value={filterRegion}
              onChange={(e) => { 
                setFilterRegion(e.target.value); 
                setFilterArea("all"); 
                setSelectedVisitIds([]); 
              }}
              className="block rounded-xl border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
            >
              <option value="all">ทั้งหมด (ทุกเขตสุขภาพ)</option>
              {uniqueRegions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          )}

          {(role === "SSO" || role === "SSJ" || role === "SBS") && (
            <select
              value={filterArea}
              onChange={(e) => { setFilterArea(e.target.value); setSelectedVisitIds([]); }}
              className="block rounded-xl border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
            >
              <option value="all">ทั้งหมด ({role === "SSO" ? "ทุกตำบล" : role === "SSJ" ? "ทุกอำเภอ" : "ทุกจังหวัด"})</option>
              {availableProvinces.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          )}

          {selectedVisitIds.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction(role === "SSO" ? "APPROVED_BY_SSO" : "APPROVED_BY_SSJ")}
                disabled={isProcessing === "bulk"}
                className="inline-flex items-center gap-x-1.5 rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50"
              >
                <CheckCircle size={16} /> อนุมัติ ({selectedVisitIds.length})
              </button>
              <button
                onClick={() => handleBulkAction(role === "SSO" ? "SUBMITTED_TO_RH_ST" : "APPROVED_BY_RH_ST")}
                disabled={isProcessing === "bulk"}
                className="inline-flex items-center gap-x-1.5 rounded-xl bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:opacity-50"
              >
                <XCircle size={16} /> ส่งกลับ ({selectedVisitIds.length})
              </button>
            </div>
          )}
        </div>

        {role === "OSP" && (
          <Link
            href="/dashboard/visits/new"
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <PlusCircle size={18} />
            บันทึกเยี่ยมบ้าน
          </Link>
        )}
      </div>

      <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 sm:rounded-xl">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              {(role === "SSO" || role === "SSJ") && (
                <th scope="col" className="relative px-4 sm:w-12 sm:px-6">
                  {actionableVisits.length > 0 && (
                    <input
                      type="checkbox"
                      className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 sm:left-6"
                      checked={selectedVisitIds.length === actionableVisits.length && actionableVisits.length > 0}
                      onChange={handleSelectAll}
                    />
                  )}
                </th>
              )}
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                วันที่
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                ผู้รับบริการ
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                ผู้บันทึก (อสพ.)
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
            {filteredVisits.map((visit) => (
              <tr key={visit.id}>
                {(role === "SSO" || role === "SSJ") && (
                  <td className="relative px-4 sm:w-12 sm:px-6">
                    {canAction(visit) && (
                      <input
                        type="checkbox"
                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 sm:left-6"
                        value={visit.id}
                        checked={selectedVisitIds.includes(visit.id)}
                        onChange={(e) => handleSelectOne(visit.id, e.target.checked)}
                      />
                    )}
                  </td>
                )}
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {new Date(visit.createdAt).toLocaleDateString('th-TH')}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {visit.patient?.name}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {visit.createdBy?.name}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {getStatusBadge(visit.status)}
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <button 
                    onClick={() => setSelectedVisit(visit)}
                    className="text-gray-500 hover:text-gray-700 mr-4" 
                    title="ดูรายละเอียด"
                  >
                    <Eye size={18} />
                  </button>
                  
                  {role === "OSP" && visit.status === 'DRAFT' && (
                    <button
                      onClick={() => handleStatusChange(visit.id, "SUBMITTED_TO_RH_ST")}
                      disabled={isProcessing === visit.id}
                      className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                      title="ส่งให้ รพ.สต. ตรวจสอบ"
                    >
                      <Navigation size={18} />
                    </button>
                  )}

                  {role === "RH_ST" && visit.status === 'SUBMITTED_TO_RH_ST' && (
                    <button
                      onClick={() => handleStatusChange(visit.id, "APPROVED_BY_RH_ST")}
                      disabled={isProcessing === visit.id}
                      className="text-green-600 hover:text-green-900 mr-4 disabled:opacity-50"
                      title="อนุมัติส่งต่อ สสจ."
                    >
                      <CheckCircle size={18} />
                    </button>
                  )}

                  {role === "SSO" && visit.status === 'APPROVED_BY_RH_ST' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(visit.id, "APPROVED_BY_SSO")}
                        disabled={isProcessing === visit.id}
                        className="text-green-600 hover:text-green-900 mr-4 disabled:opacity-50"
                        title="ยืนยันส่งต่อ สสจ."
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button
                        onClick={() => handleStatusChange(visit.id, "SUBMITTED_TO_RH_ST")}
                        disabled={isProcessing === visit.id}
                        className="text-orange-600 hover:text-orange-900 disabled:opacity-50"
                        title="ส่งกลับ รพ.สต."
                      >
                        <XCircle size={18} />
                      </button>
                    </>
                  )}

                  {role === "SSJ" && visit.status === 'APPROVED_BY_SSO' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(visit.id, "APPROVED_BY_SSJ")}
                        disabled={isProcessing === visit.id}
                        className="text-green-600 hover:text-green-900 mr-4 disabled:opacity-50"
                        title="อนุมัติส่งต่อระดับกรม (สบส.)"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button
                        onClick={() => handleStatusChange(visit.id, "APPROVED_BY_RH_ST")}
                        disabled={isProcessing === visit.id}
                        className="text-orange-600 hover:text-orange-900 disabled:opacity-50"
                        title="ส่งกลับ สสอ."
                      >
                        <XCircle size={18} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {filteredVisits.length === 0 && (
              <tr>
                <td colSpan={(role === "SSO" || role === "SSJ") ? 6 : 5} className="py-8 text-center text-gray-500 text-sm">
                  ไม่มีประวัติการเยี่ยมบ้าน
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {selectedVisit && (
        <HomeVisitDetailModal visit={selectedVisit} onClose={() => setSelectedVisit(null)} />
      )}
    </div>
  );
}
