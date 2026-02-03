import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, FileText, DollarSign } from "lucide-react";
import { formatFullName } from "../utils/utils";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setFullName(formatFullName(user.first_name, user.last_name));
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 mt-20">
      {/* Header */}
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-green-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back {fullName}
          <span className="wave text-3xl">👋</span> Here’s what’s happening.
        </p>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Active Jobs" value="12" icon={<Calendar />} />
        <StatCard title="Customers" value="84" icon={<Users />} />
        <StatCard title="Quotes Sent" value="27" icon={<FileText />} />
        <StatCard title="Revenue (MTD)" value="$4,320" icon={<DollarSign />} />
      </section>

      {/* Main Content */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Jobs */}
        <Card className="lg:col-span-2 rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Upcoming Jobs</h2>
            <ul className="space-y-3">
              <JobItem name="John Smith" date="Tomorrow" service="Lawn Mowing" />
              <JobItem name="Sarah Lee" date="Jan 29" service="Hedge Trimming" />
              <JobItem name="Mike Brown" date="Jan 30" service="Weed Control" />
            </ul>
            <Button variant="outline" className="mt-4">
              View all jobs
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="flex flex-col gap-3">
              <Button>Create Quote</Button>
              <Button variant="secondary">Add Customer</Button>
              <Button variant="outline">Schedule Job</Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-green-700">{icon}</div>
      </CardContent>
    </Card>
  );
}

function JobItem({ name, date, service }: { name: string; date: string; service: string }) {
  return (
    <li className="flex justify-between items-center border-b pb-2 last:border-none">
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-sm text-gray-500">{service}</p>
      </div>
      <span className="text-sm text-gray-600">{date}</span>
    </li>
  );
}
