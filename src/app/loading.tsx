export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 bg-opacity-75 z-50 fixed inset-0">
      <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-3xl shadow-xl">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-indigo-600 font-medium text-sm animate-pulse">กำลังโหลดข้อมูล...</p>
      </div>
    </div>
  );
}
