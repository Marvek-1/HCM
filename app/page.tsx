import { Metadata } from "next";

export const metadata: Metadata = {
  title: "HCM - Login",
  description: "Healthcare Commodities Management System",
};

export default function HomePage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#f0f4f8] to-[#e8eef5] p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#1A2B4A] mb-4">
          HCM System
        </h1>
        <p className="text-lg text-[#4a5568] mb-8">
          Healthcare Commodities Management
        </p>
        <div className="space-y-4">
          <p className="text-[#8fa3b8] mb-6">
            Next.js migration in progress...
          </p>
          <div className="inline-block bg-white p-8 rounded-2xl shadow-lg">
            <p className="text-sm text-[#4a5568] mb-4">
              API Client Status: Connected
            </p>
            <p className="text-sm text-[#8fa3b8]">
              Database connection will be tested on first API call
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
