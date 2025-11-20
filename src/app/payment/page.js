"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = "http://127.0.0.1:8000/";

const PaymentPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    totalamount: "",
    extraaddamount: "",
    addedpersonname: "",
    payments: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API_BASE}/api/paymentdetails/`, {        
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
              console.log(response,'this is the response');


      if (response.ok) {
        setMessage("✅ Payment details added successfully!");
        setFormData({
          totalamount: "",
          extraaddamount: "",
          addedpersonname: "",
          payments: "",
        });
      } else {
        setMessage("❌ Failed to add payment details. Try again.");
      }
    } catch (error) {
      console.error(error);
      setMessage("⚠️ Error connecting to server.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-50 px-4 py-10 relative">
      {/* 🔙 Back to Home Button */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-5 right-5 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition"
      >
        ← Back to Home
      </button>

      {/* Header */}
      <div className="w-full max-w-2xl text-center mb-10">
        <h1 className="text-4xl font-semibold text-gray-800 mb-2">
          💳 Add Payment Details
        </h1>
        <p className="text-gray-500">
          Enter payment information and save it securely in the system.
        </p>
      </div>

      {/* Card Container */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
        {message && (
          <div
            className={`mb-5 text-center text-sm font-medium ${
              message.includes("✅") ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Total Amount */}
          <div className="relative">
            <input
              type="number"
              name="totalamount"
              value={formData.totalamount}
              onChange={handleChange}
              className="peer w-full border-b-2 border-gray-300 bg-transparent px-2 pt-5 pb-2 text-gray-800 placeholder-transparent focus:outline-none focus:border-blue-600 transition"
              placeholder="Total Amount"
            />
            <label className="absolute left-2 top-2.5 text-gray-500 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
              Total Amount (₹)
            </label>
          </div>

          {/* Extra Added Amount */}
          <div className="relative">
            <input
              type="number"
              name="extraaddamount"
              value={formData.extraaddamount}
              onChange={handleChange}
              className="peer w-full border-b-2 border-gray-300 bg-transparent px-2 pt-5 pb-2 text-gray-800 placeholder-transparent focus:outline-none focus:border-blue-600 transition"
              placeholder="Extra Added Amount"
            />
            <label className="absolute left-2 top-2.5 text-gray-500 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
              Extra Added Amount (₹)
            </label>
          </div>

          {/* Added Person Name */}
          <div className="relative">
            <input
              type="text"
              name="addedpersonname"
              value={formData.addedpersonname}
              onChange={handleChange}
              className="peer w-full border-b-2 border-gray-300 bg-transparent px-2 pt-5 pb-2 text-gray-800 placeholder-transparent focus:outline-none focus:border-blue-600 transition"
              placeholder="Added Person Name"
            />
            <label className="absolute left-2 top-2.5 text-gray-500 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
              Added Person Name
            </label>
          </div>

          {/* Payment Type - as Input Field */}
          <div className="relative">
            <input
              type="text"
              name="payments"
              value={formData.payments}
              onChange={handleChange}
              className="peer w-full border-b-2 border-gray-300 bg-transparent px-2 pt-5 pb-2 text-gray-800 placeholder-transparent focus:outline-none focus:border-blue-600 transition"
              placeholder="Payment Type"
            />
            <label className="absolute left-2 top-2.5 text-gray-500 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
              Payment Type
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg text-base font-medium shadow-md hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
          >
            Submit Payment
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="text-gray-400 text-xs mt-10">
        © {new Date().getFullYear()} Abraj Payment System. All Rights Reserved.
      </p>
    </div>
  );
};

export default PaymentPage;
