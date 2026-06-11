"use client";

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useRouter } from 'next/navigation';
import { HEALTH_REGIONS, getProvincesByHealthRegion } from '@/lib/healthRegions';

export default function ReportCharts({ stats, session, initialRegion = 'all', initialProvince = 'all' }: { stats: any, session: any, initialRegion?: string, initialProvince?: string }) {
  const role = session?.user?.role || "GUEST";
  const router = useRouter();
  
  let dashboardTitle = "ภาพรวมระดับประเทศ";
  if (role === "SSJ") dashboardTitle = "ภาพรวมระดับจังหวัด";
  else if (role === "SSO") dashboardTitle = "ภาพรวมระดับอำเภอ";
  else if (role === "RH_ST") dashboardTitle = "ภาพรวมระดับตำบล/รหัสไปรษณีย์";
  else if (role === "OSP") dashboardTitle = "ภาพรวมพื้นที่รับผิดชอบ (อสพ.)";

  // Process Visit Status Data
  const statusData = stats.visitsByStatus.map((item: any) => {
    let name = item.status;
    if (name === "DRAFT") name = "ร่าง (Draft)";
    if (name === "SUBMITTED_TO_RH_ST") name = "รอ รพ.สต. ตรวจสอบ";
    if (name === "APPROVED_BY_RH_ST") name = "รพ.สต. อนุมัติแล้ว";
    if (name === "APPROVED_BY_SSJ") name = "สสจ. อนุมัติแล้ว";
    return { name, value: item._count };
  });

  const STATUS_COLORS = ['#9ca3af', '#facc15', '#60a5fa', '#4ade80'];

  // Process Target Group Data
  const groupData = [
    { name: "กลุ่ม 1A", value: stats.groupStats.group1A },
    { name: "กลุ่ม 1B", value: stats.groupStats.group1B },
    { name: "กลุ่ม 2", value: stats.groupStats.group2 },
    { name: "กลุ่ม 3", value: stats.groupStats.group3 },
    { name: "กลุ่ม 4", value: stats.groupStats.group4 },
  ];

  const planCompletionPercent = stats.totalPlans > 0 
    ? Math.round((stats.approvedPlans / stats.totalPlans) * 100) 
    : 0;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Dashboard Header Tag and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 text-indigo-700 text-sm font-semibold shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-indigo-500 mr-2 animate-pulse"></span>
          {dashboardTitle}
        </div>
        
        {role === "SBS" && (
          <div className="flex gap-2 items-center flex-wrap">
            <select
              value={initialRegion}
              onChange={(e) => {
                const newRegion = e.target.value;
                const params = new URLSearchParams();
                params.set('region', newRegion);
                params.set('province', 'all');
                router.push(`/dashboard/reports?${params.toString()}`);
              }}
              className="block rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
            >
              <option value="all">ทั้งหมด (ทุกเขตสุขภาพ)</option>
              {Object.keys(HEALTH_REGIONS).map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            
            <select
              value={initialProvince}
              onChange={(e) => {
                const newProv = e.target.value;
                const params = new URLSearchParams();
                params.set('region', initialRegion);
                params.set('province', newProv);
                router.push(`/dashboard/reports?${params.toString()}`);
              }}
              className="block rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
            >
              <option value="all">ทั้งหมด (ทุกจังหวัด)</option>
              {(initialRegion === 'all' ? Object.values(HEALTH_REGIONS).flat() : getProvincesByHealthRegion(initialRegion)).sort().map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* KPI Cards with Premium Glass/Gradient Aesthetics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        
        <div className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 border border-gray-100 group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
          <div className="relative z-10">
            <dt className="text-sm font-medium text-gray-500 uppercase tracking-wider">ผู้รับบริการทั้งหมด</dt>
            <dd className="mt-2 text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              {stats.totalPatients} <span className="text-sm font-medium text-gray-400">คน</span>
            </dd>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 border border-gray-100 group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
          <div className="relative z-10">
            <dt className="text-sm font-medium text-gray-500 uppercase tracking-wider">บันทึกเยี่ยมบ้าน (รวม)</dt>
            <dd className="mt-2 text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
              {stats.totalVisits} <span className="text-sm font-medium text-gray-400">ครั้ง</span>
            </dd>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 border border-gray-100 group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
          <div className="relative z-10">
            <dt className="text-sm font-medium text-gray-500 uppercase tracking-wider">แผนการดูแลที่สร้าง</dt>
            <dd className="mt-2 text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
              {stats.totalPlans} <span className="text-sm font-medium text-gray-400">แผน</span>
            </dd>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 border border-gray-100 group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
          <div className="relative z-10">
            <dt className="text-sm font-medium text-gray-500 uppercase tracking-wider">ความสำเร็จของแผน</dt>
            <dd className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-400">{planCompletionPercent}%</span>
              <span className="text-sm font-medium text-gray-400">({stats.approvedPlans}/{stats.totalPlans})</span>
            </dd>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Chart 1: Visits by Status */}
        <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <span className="w-1.5 h-6 bg-blue-500 rounded-full mr-3"></span>
            สถานะการบันทึกเยี่ยมบ้าน
          </h3>
          <div className="h-[320px] w-full">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                  >
                    {statusData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} className="hover:opacity-80 transition-opacity" />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ color: '#1f2937', fontWeight: 600 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">ไม่มีข้อมูลการเยี่ยมบ้านในพื้นที่นี้</div>
            )}
          </div>
        </div>

        {/* Chart 2: Target Groups */}
        <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <span className="w-1.5 h-6 bg-purple-500 rounded-full mr-3"></span>
            สัดส่วนผู้รับบริการแบ่งตามกลุ่มเป้าหมาย
          </h3>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={groupData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#c084fc" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} />
                <RechartsTooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="value" fill="url(#colorValue)" radius={[6, 6, 0, 0]} name="จำนวนผู้ป่วย (คน)" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
