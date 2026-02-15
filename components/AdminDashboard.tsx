import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { QuickActions, StatCard, JobItem, Jobs } from "./";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, FileText, DollarSign } from "lucide-react";

type User = {
  first_name: string;
  last_name: string;
  email: string;
  mobile?: string;
  landline?: string,
  role: "customer" | "employee" | "admin" | "owner";
};

type AdminDashboardProps = {
  fullName: string;
  user: User;
};

export default function AdminDashboard() {

    const { user } = useAuth();
    const [fullName, setFullName] = useState("");

    useEffect(() => {
        if (user) {
        setFullName(`${user.first_name} ${user.last_name}`);
        }
    }, [user]);

    if (!user) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <div>Loading...</div>;
    }

  return (
    <div className="min-h-screen bg-gray-50 p-6 mt-20">
      <h1 className="text-3xl font-bold text-green-900">
        Dashboard
      </h1>
      {/* Stats Section */}
      <StatCard title="Active Jobs" value="12" icon={<Calendar />} />
      {/* Jobs + Quick Actions */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Jobs */}
        <Jobs />
        {/* Quick Actions */}
        <QuickActions />
      </section>
      <QuickActions />
    </div>
  );
}
