import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth, roleRedirectMap } from "../../../../context/AuthContext";
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

export default function OwnerSettings() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
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
  const [originalEmployee, setOriginalEmployee] = useState<EmployeeFormType | null>(null);

  useRoleRedirect("owner");

  // -----------------------
  // Fetch employee details
  // -----------------------
  useEffect(() => {
    if (!user) return;

    const fetchEmployee = async () => {
      try {
        const res = await fetch(`/api/admin/employees/${user.uuid}`, {
            method: "GET",
            credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch employee details");

        const formatted = {
          jobTitle: data.job_title || "",
          department: data.department || "",
          bankAccount: data.bank_account_number || "",
          irdNumber: data.ird_number || "",
          taxCode: data.tax_code || "",
          emergencyFirstName: data.emergency_contact_first_name || "",
          emergencyLastName: data.emergency_contact_last_name || "",
          emergencyPhone: data.emergency_contact_phone || "",
          hireDate: data.hire_date?.split("T")[0] || "",
        };

        setEmployeeForm(formatted);
        setOriginalEmployee(formatted);
      } catch (err: any) {
        console.error(err);
        alert("Failed to load employee details");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [user]);

  // -----------------------
  // Detect changes
  // -----------------------
  const getChangedFields = (): Partial<EmployeeFormType> => {
    if (!originalEmployee) return {};
    const patch: Partial<EmployeeFormType> = {};

    Object.keys(employeeForm).forEach(key => {
      const k = key as keyof EmployeeFormType;
      if (employeeForm[k] !== originalEmployee[k]) {
        patch[k] = employeeForm[k];
      }
    });

    return patch;
  };

  // -----------------------
  // Handle form changes
  // -----------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmployeeForm(prev => ({ ...prev, [name]: value }));
  };

  // -----------------------
  // Submit PATCH
  // -----------------------
  const handleSubmit = async () => {
    const patchData = getChangedFields();
    if (Object.keys(patchData).length === 0) {
      alert("No changes detected");
      return;
    }

    try {
      const res = await fetch(`/api/employees/${user?.uuid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patchData),
      });

      if (!res.ok) throw new Error("Failed to update employee");

      alert("Employee details updated successfully");
      setOriginalEmployee(employeeForm); // update original to match new values
    } catch (err) {
      console.error(err);
      alert("Error updating employee details");
    }
  };

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
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-green-900">Employee Settings</h1>
        <p className="text-gray-600">Update your employee details below</p>
      </header>

      <Card className="rounded-2xl shadow-sm max-w-3xl">
        <CardContent>
          {Object.keys(employeeForm).map(key => (
            <div key={key} className="mb-4">
              <label className="block font-medium text-gray-700 capitalize">
                {key.replace(/([A-Z])/g, " $1")}
              </label>
              <input
                type={key === "hireDate" ? "date" : "text"}
                name={key}
                value={(employeeForm as any)[key]}
                onChange={handleChange}
                className="border px-3 py-2 rounded w-full"
              />
            </div>
          ))}

          <Button
            onClick={handleSubmit}
            className="bg-green-700 text-white hover:bg-green-800"
          >
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
