import React, { useState } from "react";

type Props = {};

export default function email(props: Props) {

    const [formData, setFormData] = useState({
        firstName: "k",
        lastName: "t",
        mobile: "0201737777",
        landline: "",
        email: "test@test.com",
        message: "test",
        images: [
        { label: "", url: "" },
        { label: "", url: "" },
        { label: "", url: "" },
        { label: "", url: "" },
      ],
      });

  return (
    <div className="flex w-full pt-20min-h-screen flex items-start justify-center pt-20 bg-gray-100">
        <div className="w-full max-w-2xl p-6 bg-white rounded shadow">
            <div className="w-full flex flex-col bg-[#2f855a] text-white p-5 text-center">
            <h1><strong>PrimCut Mowing ltd</strong></h1>
            </div>
            <h3>New Message from Website Contact Form</h3>
            <p><strong>Full Name:</strong> {formData.firstName}{" "}{formData.lastName}</p>
            <p><strong>Phone:</strong> {formData.mobile}</p>
            <p><strong>Email:</strong> {formData.email}</p>
            <p><strong>Message:</strong><br/>{formData.message}</p>
        </div>
    </div>
  );
    
}

