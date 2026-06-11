"use client";

import { useState } from "react";
import UserTable from "./UserTable";
import PendingRequestsTable from "./PendingRequestsTable";

export default function UsersPageClient({ users, areas, pendingRequests }: { users: any[], areas: any[], pendingRequests: any[] }) {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div>
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("users")}
            className={`${
              activeTab === "users"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            ผู้ใช้งานระบบ
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`${
              activeTab === "pending"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            คำขอลงทะเบียน
            {pendingRequests.length > 0 && (
              <span className="bg-red-100 text-red-600 py-0.5 px-2.5 rounded-full text-xs font-bold">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {activeTab === "users" ? (
        <UserTable users={users} areas={areas} />
      ) : (
        <PendingRequestsTable requests={pendingRequests} />
      )}
    </div>
  );
}
