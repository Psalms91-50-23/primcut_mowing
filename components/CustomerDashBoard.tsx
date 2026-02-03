
import { Card, CardContent } from "@/components/ui/card";


export default function CustomerDashboard({ fullName, user }) {
  return (
    <div className="min-h-screen bg-gray-50 p-6 mt-20">
      <h1 className="text-3xl font-bold text-green-900">
        Welcome back {fullName}
      </h1>

      {/* Profile */}
      <ProfileCard user={user} />

      {/* Customer Only */}
      <CustomerQuotes />
      <CustomerCompletedJobs />
    </div>
  );
}
