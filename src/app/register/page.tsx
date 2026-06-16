import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          ลงทะเบียนผู้ใช้งานใหม่
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          ระบบบันทึกข้อมูลการดูแลกลุ่มเป้าหมาย
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
