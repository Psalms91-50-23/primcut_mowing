import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../../../context/AuthContext";

export default function NewEmployeePage() {
  const { user } = useAuth();
  const [quickMode, setQuickMode] = useState(true);

  // Form state
  const [form, setForm] = useState({
    businessEmail: "",
    employeeFirstName: "",
    employeeLastName: "",
    userRole: "employee",
    // Optional fields for advanced mode
    employeeHireDate: "",
    employeeContract: "casual",
    employeeDepartment: "",
    employeeJobTitle: "",
    employeeBankAccount: "",
    employeeIrdNumber: "",
    employeeTaxCode: "",
    employeeEmergencyFirstName: "",
    employeeEmergencyLastName: "",
    employeeEmergencyPhone: "",
    employeeMobile: "",
    employeeLandLine: "",
    employeeAddress: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.businessEmail || !form.employeeFirstName || !form.employeeLastName) {
      return alert("Email, First Name, and Last Name are required");
    }

    try {
      // Include logged-in user's UUID for created_by_user_uuid
      const payload = {
        ...form,
        createdByUserUUID: user?.uuid,
      };

      const res = await fetch("/api/admin/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error(err);
        return alert(err.message || "Failed to send invite");
      }

      const data = await res.json();
      alert(`Invite sent to ${form.businessEmail}`);

      // Reset form after success
      setForm({
        businessEmail: "",
        employeeFirstName: "",
        employeeLastName: "",
        userRole: "employee",
        employeeHireDate: "",
        employeeContract: "casual",
        employeeDepartment: "",
        employeeJobTitle: "",
        employeeBankAccount: "",
        employeeIrdNumber: "",
        employeeTaxCode: "",
        employeeEmergencyFirstName: "",
        employeeEmergencyLastName: "",
        employeeEmergencyPhone: "",
        employeeMobile: "",
        employeeLandLine: "",
        employeeAddress: "",
      });

    } catch (err) {
      console.error(err);
      alert("Error sending invite");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Create New Employee</h1>

      <div className="mb-4">
        <Button onClick={() => setQuickMode(!quickMode)}>
          {quickMode ? "Switch to Advanced" : "Switch to Quick"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-2 max-w-lg">
        {/* Minimal required fields */}
        <input
          type="email"
          placeholder="Email"
          name="businessEmail"
          value={form.businessEmail}
          onChange={handleChange}
          className="border px-3 py-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="First Name"
          name="employeeFirstName"
          value={form.employeeFirstName}
          onChange={handleChange}
          className="border px-3 py-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="Last Name"
          name="employeeLastName"
          value={form.employeeLastName}
          onChange={handleChange}
          className="border px-3 py-2 rounded w-full"
        />
        <select
          name="userRole"
          value={form.userRole}
          onChange={handleChange}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
          <option value="owner">Owner</option>
        </select>

        {/* Advanced optional fields */}
        {!quickMode && (
          <>
            <input
              type="date"
              placeholder="Hire Date"
              name="employeeHireDate"
              value={form.employeeHireDate}
              onChange={handleChange}
              className="border px-3 py-2 rounded w-full"
            />
            <select
              name="employeeContract"
              value={form.employeeContract}
              onChange={handleChange}
              className="border px-3 py-2 rounded w-full"
            >
              <option value="casual">Casual</option>
              <option value="part-time">Part-Time</option>
              <option value="full-time">Full-Time</option>
              <option value="contract">Contract</option>
              <option value="fixed-term">Fixed-Term</option>
            </select>
            <input
              type="text"
              placeholder="Department"
              name="employeeDepartment"
              value={form.employeeDepartment}
              onChange={handleChange}
              className="border px-3 py-2 rounded w-full"
            />
            <input
              type="text"
              placeholder="Job Title"
              name="employeeJobTitle"
              value={form.employeeJobTitle}
              onChange={handleChange}
              className="border px-3 py-2 rounded w-full"
            />
            <input
              type="text"
              placeholder="Bank Account"
              name="employeeBankAccount"
              value={form.employeeBankAccount}
              onChange={handleChange}
              className="border px-3 py-2 rounded w-full"
            />
            <input
              type="text"
              placeholder="IRD Number"
              name="employeeIrdNumber"
              value={form.employeeIrdNumber}
              onChange={handleChange}
              className="border px-3 py-2 rounded w-full"
            />
            <input
              type="text"
              placeholder="Tax Code"
              name="employeeTaxCode"
              value={form.employeeTaxCode}
              onChange={handleChange}
              className="border px-3 py-2 rounded w-full"
            />
            <input
              type="text"
              placeholder="Emergency First Name"
              name="employeeEmergencyFirstName"
              value={form.employeeEmergencyFirstName}
              onChange={handleChange}
              className="border px-3 py-2 rounded w-full"
            />
            <input
              type="text"
              placeholder="Emergency Last Name"
              name="employeeEmergencyLastName"
              value={form.employeeEmergencyLastName}
              onChange={handleChange}
              className="border px-3 py-2 rounded w-full"
            />
            <input
              type="text"
              placeholder="Emergency Phone"
              name="employeeEmergencyPhone"
              value={form.employeeEmergencyPhone}
              onChange={handleChange}
              className="border px-3 py-2 rounded w-full"
            />
            <input
              type="text"
              placeholder="Mobile"
              name="employeeMobile"
              value={form.employeeMobile}
              onChange={handleChange}
              className="border px-3 py-2 rounded w-full"
            />
            <input
              type="text"
              placeholder="Landline"
              name="employeeLandLine"
              value={form.employeeLandLine}
              onChange={handleChange}
              className="border px-3 py-2 rounded w-full"
            />
            <input
              type="text"
              placeholder="Address"
              name="employeeAddress"
              value={form.employeeAddress}
              onChange={handleChange}
              className="border px-3 py-2 rounded w-full"
            />
          </>
        )}
        <Button onClick={handleSubmit}>Send Invite</Button>
      </div>
    </div>
  );
}
