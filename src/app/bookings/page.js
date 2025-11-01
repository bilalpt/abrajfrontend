"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import PptxGenJS from "pptxgenjs";
import { saveAs } from "file-saver";

const API_BASE = "https://abrajbackend.onrender.com";

// ✅ Room Data with bed counts
const roomsData = {
  5: {
    501: 4, 502: 4, 503: 4, 504: 3, 505: 4, 506: 4, 507: 4, 508: 4, 509: 4,
    510: 4, 511: 4, 512: 4, 513: 3, 514: 2, 515: 2, 516: 3, 517: 4, 518: 4,
  },
  6: {
    601: 4, 602: 4, 603: 4, 604: 3, 605: 4, 606: 4, 607: 4, 608: 4, 609: 4,
    610: 4, 611: 4, 612: 4, 613: 3, 614: 2, 615: 2, 616: 3, 617: 4, 618: 4,
  },
  8: {
    801: 4, 802: 4, 803: 4, 804: 4, 805: 4, 806: 4, 807: 4, 808: 4, 809: 4,
    810: 4, 811: 3, 812: 2, 813: 2, 814: 3, 815: 4, 816: 4,
  },
  9: {
    901: 4, 902: 4, 903: 4, 904: 4, 905: 4, 906: 4,
  },
};

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
      const sorted = data.sort((a, b) => b.id - a.id);
      setBookings(sorted);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  // ✅ Helper to format time in 12-hour format (e.g., 2:00 PM)
  const formatTime = (timeStr) => {
    if (!timeStr) return "-";
    const [hour, minute] = timeStr.split(":");
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const adjustedHour = h % 12 || 12;
    return `${adjustedHour}:${minute} ${ampm}`;
  };

  const today = new Date().toISOString().split("T")[0];
  const normalize = (dateStr) =>
    dateStr ? new Date(dateStr).toISOString().split("T")[0] : "";
  const normalizeDateTime = (datetimeStr) =>
    datetimeStr ? new Date(datetimeStr).toISOString().split("T")[0] : "";

  const todayBookings = bookings.filter(
    (b) =>
      normalize(b.check_in_date) === today ||
      normalizeDateTime(b.created_at) === today
  );
  const upcomingBookings = bookings.filter(
    (b) => normalize(b.check_in_date) > today
  );
  const previousBookings = bookings.filter(
    (b) => normalize(b.check_in_date) < today
  );

  const totalAmountToday = todayBookings.reduce(
    (sum, b) => sum + parseFloat(b.amount || 0),
    0
  );
  const totalAmountUpcoming = upcomingBookings.reduce(
    (sum, b) => sum + parseFloat(b.amount || 0),
    0
  );
  const totalAmountPrevious = previousBookings.reduce(
    (sum, b) => sum + parseFloat(b.amount || 0),
    0
  );
  const grandTotal =
    totalAmountToday + totalAmountUpcoming + totalAmountPrevious;

  const getRoomDetails = (roomString) => {
    if (!roomString) return "-";
    const rooms = roomString.toString().split(",").map((r) => r.trim());
    return rooms
      .map((r) => {
        const floor = r[0];
        const beds =
          roomsData[floor] && roomsData[floor][r]
            ? roomsData[floor][r]
            : "?";
        return `${r} (${beds} beds)`;
      })
      .join(", ");
  };

  const handlePrint = () => window.print();

  // ✅ Download All Amounts as PDF
  const handleDownloadTotalPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("💰 Grand Total Summary", 14, 20);
    autoTable(doc, {
      head: [["Category", "Amount (₹)"]],
      body: [
        ["Today's Total", totalAmountToday.toFixed(2)],
        ["Upcoming Total", totalAmountUpcoming.toFixed(2)],
        ["Previous Total", totalAmountPrevious.toFixed(2)],
        ["Grand Total", grandTotal.toFixed(2)],
      ],
    });
    doc.save("Grand_Total_Summary.pdf");
  };

  const handlePrintTotal = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html><head><title>Grand Total Summary</title></head><body>
      <h2 style="text-align:center; color:#b91c1c;">💰 Grand Total Summary</h2>
      <table border="1" cellspacing="0" cellpadding="8" style="width:100%; text-align:center; border-collapse:collapse;">
        <tr><th>Category</th><th>Amount (₹)</th></tr>
        <tr><td>Today's Total</td><td>${totalAmountToday.toFixed(2)}</td></tr>
        <tr><td>Upcoming Total</td><td>${totalAmountUpcoming.toFixed(2)}</td></tr>
        <tr><td>Previous Total</td><td>${totalAmountPrevious.toFixed(2)}</td></tr>
        <tr><td><strong>Grand Total</strong></td><td><strong>${grandTotal.toFixed(2)}</strong></td></tr>
      </table>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6 flex-wrap">
        <h2 className="text-2xl font-bold text-gray-800">🧾 All Bookings</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handlePrint}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            🖨️ Print All
          </button>
          <button
            onClick={() => router.push("/")}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
          >
            ← Back to Home
          </button>
        </div>
      </div>

      {/* ✅ Today's Bookings */}
      <Section
        title={`📅 Today's Bookings (${today}) — Total ₹${totalAmountToday.toFixed(
          2
        )}`}
        color="text-green-700"
      >
        {todayBookings.length > 0 ? (
          <PaginatedTable
            bookings={todayBookings}
            fetchBookings={fetchBookings}
            getRoomDetails={getRoomDetails}
            formatTime={formatTime}
          />
        ) : (
          <NoData text="No bookings for today" />
        )}
      </Section>

      {/* Upcoming Bookings */}
      <Section title="🚀 Upcoming Bookings" color="text-blue-700">
        {upcomingBookings.length > 0 ? (
          <PaginatedTable
            bookings={upcomingBookings}
            fetchBookings={fetchBookings}
            getRoomDetails={getRoomDetails}
            formatTime={formatTime}
          />
        ) : (
          <NoData text="No upcoming bookings" />
        )}
      </Section>

      {/* Previous Bookings */}
      <Section title="🕒 Previous Bookings" color="text-gray-800">
        {previousBookings.length > 0 ? (
          <PaginatedTable
            bookings={previousBookings}
            fetchBookings={fetchBookings}
            getRoomDetails={getRoomDetails}
            formatTime={formatTime}
          />
        ) : (
          <NoData text="No previous bookings" />
        )}
      </Section>

      {/* ✅ Grand Total Summary Section */}
      <div className="bg-white shadow-md rounded-xl p-6 mt-10 text-gray-800">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h3 className="text-2xl font-semibold text-center text-red-700 flex-1">
            💰 Grand Total Summary
          </h3>
          <div className="flex gap-3">
            <button
              onClick={handlePrintTotal}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              🖨️ Print
            </button>
            <button
              onClick={handleDownloadTotalPDF}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              ⬇️ Download PDF
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div className="bg-green-100 p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-green-700">Today's Total</h4>
            <p className="text-xl font-bold text-green-800">
              ₹{totalAmountToday.toFixed(2)}
            </p>
          </div>
          <div className="bg-blue-100 p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-blue-700">Upcoming Total</h4>
            <p className="text-xl font-bold text-blue-800">
              ₹{totalAmountUpcoming.toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-gray-700">Previous Total</h4>
            <p className="text-xl font-bold text-gray-800">
              ₹{totalAmountPrevious.toFixed(2)}
            </p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-yellow-700">Grand Total</h4>
            <p className="text-2xl font-bold text-yellow-800">
              ₹{grandTotal.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ Section Wrapper
const Section = ({ title, color, children }) => (
  <div className="bg-white rounded-xl shadow-md p-6 mb-10 overflow-x-auto">
    <h3 className={`text-xl font-semibold mb-4 ${color}`}>{title}</h3>
    {children}
  </div>
);

const NoData = ({ text }) => (
  <p className="text-center text-gray-500 italic">{text}</p>
);

// ✅ PaginatedTable with 12-hour format
const PaginatedTable = ({
  bookings,
  fetchBookings,
  getRoomDetails,
  formatTime,
}) => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(bookings.length / itemsPerPage);
  const currentBookings = bookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  return (
    <>
      <table className="min-w-full text-sm text-left text-gray-600">
        <thead className="bg-gray-200 text-gray-800">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Phone</th>
            <th className="px-4 py-2">Rooms (Beds)</th>
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
              <td className="px-4 py-2">{getRoomDetails(b.selected_rooms)}</td>
              <td className="px-4 py-2">{b.check_in_date}</td>
              <td className="px-4 py-2">{formatTime(b.check_in_time)}</td>
              <td className="px-4 py-2">{b.check_out_date}</td>
              <td className="px-4 py-2 font-semibold text-green-700">
                ₹{b.amount}
              </td>
              <td className="px-4 py-2 text-center space-x-1">
                <button
                  onClick={() => router.push(`/bookingeditpage/${b.id}`)}
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
