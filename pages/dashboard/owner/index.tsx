import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, FileText, DollarSign } from "lucide-react";
import { useAuth, roleRedirectMap } from "../../../context/AuthContext";
import { useRouter } from "next/router";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";

type EmployeeFormType = {
  jobTitle: string;
  department: string;
  bankAccount: string;
  irdNumber: string;
  taxCode: string;
  emergencyFirstName: string;
  emergencyLastName: string;
  emergencyPhone: string;
  hireDate: string;
};

export default function OwnerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("employee");
  const [employeeForm, setEmployeeForm] = useState<EmployeeFormType>({
    jobTitle: "",
    department: "",
    bankAccount: "",
    irdNumber: "",
    taxCode: "",
    emergencyFirstName: "",
    emergencyLastName: "",
    emergencyPhone: "",
    hireDate: "",
  });

  const [pendingQuotes, setPendingQuotes] = useState<any[]>([]);

  // ⚡ Only allow owner
  useRoleRedirect("owner");

  useEffect(() => {
    if (!user) return;

    if (user.role !== "owner") {
      const redirectPath = roleRedirectMap[user.role] || "/customer";
      router.replace(redirectPath);
      return;
    }

    setFullName(`${user.first_name} ${user.last_name}`);
    setLoading(false);

    // Fetch pending quotes
    fetchPendingQuotes();
    // Fetch employee details for owner
    fetchEmployeeDetails();
  }, [user]);

  const fetchPendingQuotes = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quotes/pending`);
      if (!res.ok) throw new Error("Failed to fetch quotes");
      const data = await res.json();
      setPendingQuotes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmployeeDetails = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/employees/${user?.uuid}`);
      if (!res.ok) throw new Error("Failed to fetch employee details");
      const data = await res.json();
      setEmployeeForm({
        jobTitle: data.job_title || "",
        department: data.department || "",
        bankAccount: data.bank_account_number || "",
        irdNumber: data.ird_number || "",
        taxCode: data.tax_code || "",
        emergencyFirstName: data.emergency_contact_first_name || "",
        emergencyLastName: data.emergency_contact_last_name || "",
        emergencyPhone: data.emergency_contact_phone || "",
        hireDate: data.hire_date?.split("T")[0] || "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmployeeForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEmployeeSubmit = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/employees/${user?.uuid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employeeForm),
      });
      if (!res.ok) throw new Error("Failed to update employee");
      alert("Employee details updated successfully");
    } catch (err) {
      console.error(err);
      alert("Error updating employee");
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail) return alert("Enter an email");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      if (!res.ok) throw new Error("Failed to send invite");
      alert(`Invite sent to ${inviteEmail}`);
      setInviteEmail("");
      setInviteRole("employee");
    } catch (err) {
      console.error(err);
      alert("Error sending invite");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 mt-20">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-green-900">Owner Dashboard</h1>
        <p className="text-gray-600">Welcome back {fullName} 👋</p>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Active Jobs" value="12" icon={<Calendar />} />
        <StatCard title="Customers" value="84" icon={<Users />} />
        <StatCard title="Quotes Sent" value="27" icon={<FileText />} />
        <StatCard title="Revenue (MTD)" value="$4,320" icon={<DollarSign />} />
      </section>

      {/* Quick Actions + Invite */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <Card className="rounded-2xl shadow-sm">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">Invite User</h2>
            <input
              type="email"
              placeholder="User email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              className="border px-3 py-2 rounded w-full mb-2"
            />
            <select
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value)}
              className="border px-3 py-2 rounded w-full mb-2"
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
            <Button onClick={handleInviteUser}>Send Invite</Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">Update Your Employee Details</h2>
            {Object.keys(employeeForm).map(key => (
              <div key={key} className="mb-2">
                <label className="block font-medium text-gray-700 capitalize">{key.replace(/([A-Z])/g, " $1")}</label>
                <input
                  type={key === "hireDate" ? "date" : "text"}
                  name={key}
                  value={(employeeForm as any)[key]}
                  onChange={handleEmployeeChange}
                  className="border px-3 py-2 rounded w-full"
                />
              </div>
            ))}
            <Button onClick={handleEmployeeSubmit}>Save</Button>
          </CardContent>
        </Card>
      </section>

      {/* Pending Quotes */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Pending Quotes / Drafts</h2>
        {pendingQuotes.length === 0 ? (
          <p>No pending quotes</p>
        ) : (
          <ul className="space-y-2">
            {pendingQuotes.map(quote => (
              <li key={quote.uuid} className="border p-3 rounded flex justify-between items-center">
                <span>{quote.contact_first_name} {quote.contact_last_name} - ${quote.total_amount}</span>
                <Button
                  onClick={() => router.push(`/quotes/edit/${quote.uuid}`)}
                  size="sm"
                >
                  Update Quote
                </Button>
              </li>
            ))}
          </ul>
        )}
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
