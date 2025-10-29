"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_BASE = "https://abrajbackend.onrender.com";

const EditBookingPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/bookings/${id}/`);
        const data = await res.json();
        setBooking(data);
      } catch (error) {
        console.error("Error fetching booking:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBooking();
  }, [id]);

  const handleUpdate = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking),
      });
      if (res.ok) {
        setMessage("✅ Booking updated successfully!");
        setTimeout(() => router.push("/bookings"), 1500);
      } else {
        setMessage("❌ Update failed. Try again.");
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      setMessage("⚠️ Server error.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-blue-700 text-lg font-semibold">
        Loading booking details...
      </div>
    );

  return (
    <div className="flex flex-col md:flex-row gap-8 p-6 bg-gray-50 min-h-screen">
      {/* LEFT SECTION */}
      <div className="flex-1 bg-white p-6 rounded-xl shadow-md">
        <button
          onClick={() => router.push("/bookings")}
          className="text-gray-600 mb-4 flex items-center gap-2 font-medium hover:text-gray-900 transition"
        >
          ← Back to Bookings
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          ✏️ Edit Booking 
        </h2>

        {booking && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdate();
            }}
            className="space-y-5"
          >
            <div>
              <label className="text-gray-700 mb-2 font-medium block">
                Guest Name:
              </label>
              <input
                type="text"
                value={booking.name || ""}
                onChange={(e) =>
                  setBooking({ ...booking, name: e.target.value })
                }
                className="w-full bg-gray-100 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="text-gray-700 mb-2 font-medium block">
                Phone Number:
              </label>
              <input
                type="tel"
                value={booking.phone_number || ""}
                onChange={(e) =>
                  setBooking({ ...booking, phone_number: e.target.value })
                }
                className="w-full bg-gray-100 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="text-gray-700 mb-2 font-medium block">
                Check-In Time:
              </label>
              <input
                type="time"
                value={booking.check_in_time || ""}
                onChange={(e) =>
                  setBooking({ ...booking, check_in_time: e.target.value })
                }
                className="w-full bg-gray-100 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="text-gray-700 mb-2 font-medium block">
                Check-In Date:
              </label>
              <input
                type="date"
                value={booking.check_in_date || ""}
                onChange={(e) =>
                  setBooking({ ...booking, check_in_date: e.target.value })
                }
                className="w-full bg-gray-100 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="text-gray-700 mb-2 font-medium block">
                Check-Out Date:
              </label>
              <input
                type="date"
                value={booking.check_out_date || ""}
                onChange={(e) =>
                  setBooking({ ...booking, check_out_date: e.target.value })
                }
                className="w-full bg-gray-100 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="text-gray-700 mb-2 font-medium block">
                Amount (₹):
              </label>
              <input
                type="number"
                value={booking.amount || ""}
                onChange={(e) =>
                  setBooking({ ...booking, amount: e.target.value })
                }
                className="w-full bg-gray-100 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <button
              type="submit"
              className="mt-6 w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
            >
              💾 Update Booking
            </button>

            {message && (
              <p
                className={`text-center mt-4 text-sm font-medium ${
                  message.startsWith("✅")
                    ? "text-green-700"
                    : "text-red-600"
                }`}
              >
                {message}
              </p>
            )}
          </form>
        )}
      </div>

      {/* RIGHT SECTION */}
      <div className="w-full md:w-1/3 bg-white p-6 rounded-xl shadow-md h-fit">
        <h3 className="text-xl font-semibold border-b pb-3 mb-4">
          Booking Details
        </h3>

        {booking ? (
          <div className="space-y-3 text-gray-700 text-sm">
            <p>
              <strong>Guest:</strong> {booking.name}
            </p>
            <p>
              <strong>Phone:</strong> {booking.phone_number}
            </p>
            <p>
              <strong>Check-In:</strong>{" "}
              {booking.check_in_date} {booking.check_in_time}
            </p>
            <p>
              <strong>Check-Out:</strong> {booking.check_out_date}
            </p>
            <p>
              <strong>Amount:</strong> ₹{booking.amount}
            </p>
          </div>
        ) : (
          <p className="text-gray-400 italic">No booking details loaded.</p>
        )}
      </div>
    </div>
  );
};

export default EditBookingPage;
