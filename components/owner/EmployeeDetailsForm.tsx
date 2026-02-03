import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

interface EmployeeDetailsFormProps {}

const EmployeeDetailsForm: React.FC<EmployeeDetailsFormProps> = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    jobTitle: "",
    bankAccount: "",
    irdNumber: "",
    taxCode: "",
    department: "",
    emergencyFirstName: "",
    emergencyLastName: "",
    emergencyPhone: "",
    hireDate: "",
  });

  useEffect(() => {
    if (!user) return;
    // fetch employee details
    const fetchEmployee = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/employees/${user.uuid}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load");

        setForm({
          jobTitle: data.job_title || "",
          bankAccount: data.bank_account_number || "",
          irdNumber: data.ird_number || "",
          taxCode: data.tax_code || "",
          department: data.department || "",
          emergencyFirstName: data.emergency_contact_first_name || "",
          emergencyLastName: data.emergency_contact_last_name || "",
          emergencyPhone: data.emergency_contact_phone || "",
          hireDate: data.hire_date ? data.hire_date.split("T")[0] : "",
        });
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/employees/${user?.uuid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");

      toast.success("Employee details updated");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Loading employee details...</p>;
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">My Employee Details</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
        <input
          name="jobTitle"
          value={form.jobTitle}
          onChange={handleChange}
          placeholder="Job Title"
          className="border rounded-lg p-2 w-full"
        />
        <input
          name="bankAccount"
          value={form.bankAccount}
          onChange={handleChange}
          placeholder="Bank Account Number"
          className="border rounded-lg p-2 w-full"
        />
        <input
          name="irdNumber"
          value={form.irdNumber}
          onChange={handleChange}
          placeholder="IRD Number"
          className="border rounded-lg p-2 w-full"
        />
        <input
          name="taxCode"
          value={form.taxCode}
          onChange={handleChange}
          placeholder="Tax Code"
          className="border rounded-lg p-2 w-full"
        />
        <input
          name="department"
          value={form.department}
          onChange={handleChange}
          placeholder="Department"
          className="border rounded-lg p-2 w-full"
        />
        <input
          name="emergencyFirstName"
          value={form.emergencyFirstName}
          onChange={handleChange}
          placeholder="Emergency Contact First Name"
          className="border rounded-lg p-2 w-full"
        />
        <input
          name="emergencyLastName"
          value={form.emergencyLastName}
          onChange={handleChange}
          placeholder="Emergency Contact Last Name"
          className="border rounded-lg p-2 w-full"
        />
        <input
          name="emergencyPhone"
          value={form.emergencyPhone}
          onChange={handleChange}
          placeholder="Emergency Contact Phone"
          className="border rounded-lg p-2 w-full"
        />
        <input
          name="hireDate"
          value={form.hireDate}
          onChange={handleChange}
          type="date"
          placeholder="Hire Date"
          className="border rounded-lg p-2 w-full"
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Update Details"}
        </Button>
      </form>
    </div>
  );
};

export default EmployeeDetailsForm;
