import { getDashboardStats } from "./actions";
import ReportCharts from "./ReportCharts";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const session = await getServerSession(authOptions);
  
  const sp = await searchParams;
  const region = typeof sp.region === 'string' ? sp.region : 'all';
  const province = typeof sp.province === 'string' ? sp.province : 'all';

  const stats = await getDashboardStats(region, province);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">รายงานสรุปผลการดำเนินงาน (Executive Dashboard)</h1>
          <p className="mt-2 text-sm text-gray-700">
            ภาพรวมผลการลงพื้นที่เยี่ยมบ้านของ อสพ. และสถิติสุขภาพของผู้รับบริการ
          </p>
        </div>
      </div>
      
      <div className="mt-8">
        <ReportCharts stats={stats} session={session} initialRegion={region} initialProvince={province} />
      </div>
    </div>
  );
}
