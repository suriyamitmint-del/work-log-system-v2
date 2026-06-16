export default function DashboardLoading() {
  return (
    <div className="flex-grow flex items-center justify-center h-full min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-gray-500 font-medium text-sm animate-pulse">กำลังดึงข้อมูล...</p>
      </div>
    </div>
  );
}
