"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import "jspdf-autotable";

const API_BASE = "https://abrajbackend.onrender.com";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings/`);
      const data = await res.json();
      // Sort latest first (highest ID = most recent)
      const sorted = data.sort((a, b) => b.id - a.id);
      setBookings(sorted);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  // Get today's date in YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  // Normalize date format
  const normalize = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().split("T")[0];
  };

  // Convert 24h time to 12h format
  const formatTime12h = (timeStr) => {
    if (!timeStr) return "-";
    const [hour, minute] = timeStr.split(":");
    let h = parseInt(hour, 10);
    const suffix = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${minute} ${suffix}`;
  };

  // Separate bookings
  const todayBookings = bookings
    .filter((b) => normalize(b.check_in_date) === today)
    .sort((a, b) => b.id - a.id);

  const previousBookings = bookings
    .filter((b) => normalize(b.check_in_date) < today)
    .sort((a, b) => b.id - a.id);

  const upcomingBookings = bookings
    .filter((b) => normalize(b.check_in_date) > today)
    .sort((a, b) => b.id - a.id);

  // Total amount for today's bookings
  const totalAmountToday = todayBookings.reduce(
    (sum, b) => sum + parseFloat(b.amount || 0),
    0
  );

  // PDF download for today's bookings
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`Today's Bookings Report (${today})`, 14, 15);
    doc.text(`Total Amount: ₹${totalAmountToday}`, 14, 25);

    const tableData = todayBookings.map((b) => [
      b.name,
      b.phone_number,
      b.selected_rooms,
      b.check_in_date,
      formatTime12h(b.check_in_time),
      b.check_out_date,
      `₹${b.amount}`,
    ]);

    doc.autoTable({
      head: [
        [
          "Name",
          "Phone",
          "Rooms",
          "Check-In Date",
          "Check-In Time",
          "Check-Out",
          "Amount",
        ],
      ],
      body: tableData,
      startY: 35,
    });

    doc.save(`Bookings_${today}.pdf`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">🧾 All Bookings</h2>
        <button
          onClick={() => router.push("/")}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          ← Back to Home
        </button>
      </div>

      {/* Upcoming Bookings */}
      <Section title="🚀 Upcoming Bookings" color="text-blue-700">
        {upcomingBookings.length > 0 ? (
          <PaginatedTable
            bookings={upcomingBookings}
            fetchBookings={fetchBookings}
          />
        ) : (
          <NoData text="No upcoming bookings" />
        )}
      </Section>

      {/* Today's Bookings */}
      <Section
        title={`📅 Today's Bookings (${today})`}
        color="text-green-700"
        extra={
          todayBookings.length > 0 && (
            <button
              onClick={downloadPDF}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              ⬇️ Download PDF (₹{totalAmountToday})
            </button>
          )
        }
      >
        {todayBookings.length > 0 ? (
          <PaginatedTable
            bookings={todayBookings}
            fetchBookings={fetchBookings}
          />
        ) : (
          <NoData text="No bookings for today" />
        )}
      </Section>

      {/* Previous Bookings */}
      <Section title="🕒 Previous Bookings" color="text-gray-800">
        {previousBookings.length > 0 ? (
          <PaginatedTable
            bookings={previousBookings}
            fetchBookings={fetchBookings}
          />
        ) : (
          <NoData text="No previous bookings" />
        )}
      </Section>
    </div>
  );
};

// Section Wrapper
const Section = ({ title, color, extra, children }) => (
  <div className="bg-white rounded-xl shadow-md p-6 mb-10 overflow-x-auto">
    <div className="flex justify-between items-center mb-4">
      <h3 className={`text-xl font-semibold ${color}`}>{title}</h3>
      {extra}
    </div>
    {children}
  </div>
);

// No Data Display
const NoData = ({ text }) => (
  <p className="text-center text-gray-500 italic">{text}</p>
);

// Table with Pagination
const PaginatedTable = ({ bookings, fetchBookings }) => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(bookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBookings = bookings.slice(startIndex, startIndex + itemsPerPage);

  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    try {
      await fetch(`${API_BASE}/api/bookings/${id}/`, { method: "DELETE" });
      alert("Booking deleted successfully");
      fetchBookings();
    } catch (error) {
      console.error("Error deleting booking:", error);
    }
  };

  // ✅ Only navigate if valid ID exists
  const handleEdit = (id) => {
    if (id && Number.isInteger(id)) {
      router.push(`/bookingeditpage/${id}`);
    } else {
      alert("Invalid booking ID — cannot open edit page.");
    }
  };

  const formatTime12h = (timeStr) => {
    if (!timeStr) return "-";
    const [hour, minute] = timeStr.split(":");
    let h = parseInt(hour, 10);
    const suffix = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${minute} ${suffix}`;
  };

  return (
    <>
      <table className="min-w-full text-sm text-left text-gray-600">
        <thead className="bg-gray-200 text-gray-800">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Phone</th>
            <th className="px-4 py-2">Rooms</th>
            <th className="px-4 py-2">Check-In Date</th>
            <th className="px-4 py-2">Check-In Time</th>
            <th className="px-4 py-2">Check-Out</th>
            <th className="px-4 py-2">Amount</th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentBookings.map((b, i) => (
            <tr key={i} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2">{b.name}</td>
              <td className="px-4 py-2">{b.phone_number}</td>
              <td className="px-4 py-2">{b.selected_rooms}</td>
              <td className="px-4 py-2">{b.check_in_date}</td>
              <td className="px-4 py-2">{formatTime12h(b.check_in_time)}</td>
              <td className="px-4 py-2">{b.check_out_date}</td>
              <td className="px-4 py-2 font-semibold text-green-700">
                ₹{b.amount}
              </td>
              <td className="px-4 py-2 text-center space-x-2">
                <button
                  onClick={() => handleEdit(b.id)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 space-x-2">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-lg border text-sm ${
              currentPage === 1
                ? "text-gray-400 border-gray-300 cursor-not-allowed"
                : "text-gray-700 border-gray-400 hover:bg-gray-100"
            }`}
          >
            Prev
          </button>
          <span className="text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-lg border text-sm ${
              currentPage === totalPages
                ? "text-gray-400 border-gray-300 cursor-not-allowed"
                : "text-gray-700 border-gray-400 hover:bg-gray-100"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </>
  );
};

export default Bookings;
