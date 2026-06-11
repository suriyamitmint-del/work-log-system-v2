"use client";

import { MODULE_A, MODULE_B, MODULE_C, MODULE_D, MODULE_COMMON } from "@/lib/constants";

const ALL_ACTIVITIES = [...MODULE_A, ...MODULE_B, ...MODULE_C, ...MODULE_D, ...MODULE_COMMON];

export default function HomeVisitDetailModal({ visit, onClose }: { visit: any, onClose: () => void }) {
  if (!visit) return null;
  const { patient } = visit;

  let activityResults: Record<string, boolean> = {};
  if (visit.activityResults) {
    try {
      activityResults = JSON.parse(visit.activityResults);
    } catch (e) {
      console.error("Failed to parse activityResults", e);
    }
  }

  const checkedActivities = Object.entries(activityResults)
    .filter(([_, isChecked]) => isChecked)
    .map(([id, _]) => ALL_ACTIVITIES.find(a => a.id === id))
    .filter(a => a !== undefined);

  const renderStatus = () => {
    if (visit.status === 'APPROVED_BY_SSJ') {
      return visit.ssjApprover ? 
        <span style={{ fontWeight: '500', color: '#047857' }}>อนุมัติโดย: {visit.ssjApprover.name} เมื่อ {new Date(visit.ssjApprovedAt).toLocaleString('th-TH')}</span> :
        <span style={{ fontWeight: '500', color: '#047857' }}>สสจ. อนุมัติแล้ว</span>;
    }
    if (visit.status === 'APPROVED_BY_SSO') {
      return visit.ssoApprover ?
        <span style={{ fontWeight: '500', color: '#047857' }}>ยืนยันโดย: {visit.ssoApprover.name} เมื่อ {new Date(visit.ssoApprovedAt).toLocaleString('th-TH')}</span> :
        <span style={{ fontWeight: '500', color: '#047857' }}>สสอ. ยืนยันแล้ว</span>;
    }
    if (visit.status === 'APPROVED_BY_RH_ST') {
      return visit.rhstApprover ?
        <span style={{ fontWeight: '500', color: '#047857' }}>อนุมัติโดย: {visit.rhstApprover.name} เมื่อ {new Date(visit.rhstApprovedAt).toLocaleString('th-TH')}</span> :
        <span style={{ fontWeight: '500', color: '#047857' }}>รพ.สต. อนุมัติแล้ว</span>;
    }
    if (visit.status === 'SUBMITTED_TO_RH_ST') {
      return <span style={{ fontWeight: '500', color: '#ca8a04' }}>รอตรวจสอบ (รพ.สต.)</span>;
    }
    if (visit.status === 'DRAFT') {
      return <span style={{ fontWeight: '500', color: '#4b5563' }}>ร่าง (Draft)</span>;
    }
    return <span style={{ fontWeight: '500', color: '#047857' }}>{visit.status}</span>;
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflowY: 'auto', padding: '20px' }}>
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', width: '100%', maxWidth: '600px', color: 'black', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>รายละเอียดการเยี่ยมบ้าน</h3>
          <button onClick={onClose} style={{ fontSize: '20px', cursor: 'pointer', background: 'none', border: 'none' }}>&times;</button>
        </div>
        
        <div style={{ marginBottom: '20px', backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px', lineHeight: '1.6' }}>
          <p><strong>ผู้รับบริการ:</strong> {patient?.name} (CID: {patient?.cid})</p>
          <p><strong>ผู้บันทึก (อสพ.):</strong> {visit.createdBy?.name}</p>
          <p><strong>วันที่บันทึก:</strong> {new Date(visit.createdAt).toLocaleString('th-TH')}</p>
          <p><strong>สถานะ:</strong> {renderStatus()}</p>
        </div>

        {(visit.imageUrl || (visit.gpsLat && visit.gpsLng)) && (
          <>
            <h4 style={{ fontWeight: 'bold', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>รูปถ่ายและพิกัดสถานที่</h4>
            <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              {visit.imageUrl && (
                <div>
                  <img src={visit.imageUrl} alt="Home Visit" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                </div>
              )}
              {visit.gpsLat && visit.gpsLng && (
                <div>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${visit.gpsLat},${visit.gpsLng}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '6px', textDecoration: 'none', border: '1px solid #bfdbfe', fontWeight: '500' }}
                  >
                    📍 เปิดดูตำแหน่งใน Google Maps
                  </a>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>พิกัด: {Number(visit.gpsLat).toFixed(6)}, {Number(visit.gpsLng).toFixed(6)}</p>
                </div>
              )}
            </div>
          </>
        )}

        <h4 style={{ fontWeight: 'bold', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>ข้อมูลสุขภาพพื้นฐาน (Vitals)</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          <div><span style={{ color: '#6b7280' }}>ความดันโลหิต (BP):</span> {visit.bloodPressure || '-'}</div>
          <div><span style={{ color: '#6b7280' }}>น้ำตาลในเลือด:</span> {visit.bloodSugar ? `${visit.bloodSugar} mg/dL` : '-'}</div>
          <div><span style={{ color: '#6b7280' }}>น้ำหนัก:</span> {visit.weight ? `${visit.weight} กก.` : '-'}</div>
          <div><span style={{ color: '#6b7280' }}>ส่วนสูง:</span> {visit.height ? `${visit.height} ซม.` : '-'}</div>
          <div><span style={{ color: '#6b7280' }}>อุณหภูมิ:</span> {visit.temperature ? `${visit.temperature} °C` : '-'}</div>
          <div><span style={{ color: '#6b7280' }}>ชีพจร:</span> {visit.pulse ? `${visit.pulse} ครั้ง/นาที` : '-'}</div>
        </div>

        {checkedActivities.length > 0 && (
          <>
            <h4 style={{ fontWeight: 'bold', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>กิจกรรมที่ปฏิบัติแล้ว</h4>
            <div style={{ marginBottom: '20px', backgroundColor: '#eff6ff', padding: '15px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
              <ul style={{ listStyleType: 'disc', paddingLeft: '20px', color: '#1e3a8a', fontSize: '14px' }}>
                {checkedActivities.map((act, index) => (
                  <li key={index} style={{ marginBottom: '4px' }}>{act?.label}</li>
                ))}
              </ul>
            </div>
          </>
        )}

        {(visit.adlScore !== null) && (
          <>
            <h4 style={{ fontWeight: 'bold', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>ประเมิน ADL (กลุ่ม 1A/1B)</h4>
            <div style={{ marginBottom: '20px' }}>
              <p><strong>คะแนน ADL:</strong> {visit.adlScore} / 20</p>
            </div>
          </>
        )}

        {(visit.q2Score !== null || visit.q9Score !== null || visit.st5Score !== null) && (
          <>
            <h4 style={{ fontWeight: 'bold', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>ประเมินสุขภาพจิต (กลุ่ม 4)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              <div><span style={{ color: '#6b7280' }}>คะแนน 2Q:</span> {visit.q2Score !== null ? visit.q2Score : '-'}</div>
              <div><span style={{ color: '#6b7280' }}>คะแนน 9Q:</span> {visit.q9Score !== null ? visit.q9Score : '-'}</div>
              <div><span style={{ color: '#6b7280' }}>คะแนน ST-5:</span> {visit.st5Score !== null ? visit.st5Score : '-'}</div>
            </div>
          </>
        )}

        <h4 style={{ fontWeight: 'bold', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>บันทึกเพิ่มเติม</h4>
        <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px', minHeight: '60px' }}>
          {visit.notes || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>ไม่มีบันทึกเพิ่มเติม</span>}
        </div>

        <h4 style={{ fontWeight: 'bold', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>ประวัติการบันทึก/ตรวจสอบ</h4>
        <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px', fontSize: '14px', lineHeight: '1.6' }}>
          <div>
            <strong>บันทึกโดย (อสพ.):</strong> {visit.createdBy?.name} <br/>
            <span style={{ color: '#6b7280', fontSize: '12px' }}>เมื่อ: {new Date(visit.createdAt).toLocaleString('th-TH')}</span>
          </div>
          
          {visit.rhstApprover && (
            <div style={{ marginTop: '10px', borderTop: '1px dashed #d1d5db', paddingTop: '10px' }}>
              <strong>รพ.สต. ตรวจสอบโดย:</strong> {visit.rhstApprover.name} <br/>
              <span style={{ color: '#6b7280', fontSize: '12px' }}>เมื่อ: {visit.rhstApprovedAt ? new Date(visit.rhstApprovedAt).toLocaleString('th-TH') : '-'}</span>
            </div>
          )}

          {visit.ssoApprover && (
            <div style={{ marginTop: '10px', borderTop: '1px dashed #d1d5db', paddingTop: '10px' }}>
              <strong>สสอ. ยืนยันโดย:</strong> {visit.ssoApprover.name} <br/>
              <span style={{ color: '#6b7280', fontSize: '12px' }}>เมื่อ: {visit.ssoApprovedAt ? new Date(visit.ssoApprovedAt).toLocaleString('th-TH') : '-'}</span>
            </div>
          )}

          {visit.ssjApprover && (
            <div style={{ marginTop: '10px', borderTop: '1px dashed #d1d5db', paddingTop: '10px' }}>
              <strong>สสจ. อนุมัติโดย:</strong> {visit.ssjApprover.name} <br/>
              <span style={{ color: '#6b7280', fontSize: '12px' }}>เมื่อ: {visit.ssjApprovedAt ? new Date(visit.ssjApprovedAt).toLocaleString('th-TH') : '-'}</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button type="button" onClick={onClose} style={{ padding: '8px 16px', backgroundColor: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
