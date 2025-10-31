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

  // ✅ Get today's date (YYYY-MM-DD)
  const today = new Date().toISOString().split("T")[0];

  const normalize = (dateStr) =>
    dateStr ? new Date(dateStr).toISOString().split("T")[0] : "";

  const normalizeDateTime = (datetimeStr) =>
    datetimeStr ? new Date(datetimeStr).toISOString().split("T")[0] : "";

  // ✅ Include bookings with check_in_date or created_at = today
  const todayBookings = bookings.filter(
    (b) =>
      normalize(b.check_in_date) === today ||
      normalizeDateTime(b.created_at) === today
  );

  // ✅ Separate future and past
  const upcomingBookings = bookings.filter(
    (b) => normalize(b.check_in_date) > today
  );

  const previousBookings = bookings.filter(
    (b) => normalize(b.check_in_date) < today
  );

  // ✅ Calculate total for today's bookings
  const totalAmountToday = todayBookings.reduce(
    (sum, b) => sum + parseFloat(b.amount || 0),
    0
  );

  // ✅ Room details formatter
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
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

      {/* ✅ Today's Bookings Section */}
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
          />
        ) : (
          <NoData text="No previous bookings" />
        )}
      </Section>
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

// ✅ Paginated Table (your original preserved)
const PaginatedTable = ({ bookings, fetchBookings, getRoomDetails }) => {
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

  const handleEdit = (id) => router.push(`/bookingeditpage/${id}`);

  const handlePrintBooking = (b) => {
    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <html>
        <head>
          <title>Booking Receipt - ${b.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; background: #fff; }
            .header { text-align: center; border-bottom: 3px solid #800000; padding-bottom: 10px; }
            .header h1 { margin: 0; color: #800000; font-size: 22px; font-weight: bold; }
            .header h2 { margin: 2px 0; font-size: 15px; color: #444; }
            .details { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .details th, .details td { text-align: left; padding: 10px; border-bottom: 1px solid #ddd; }
            .details th { background: #f8f8f8; width: 220px; color: #222; }
            .amount { font-size: 18px; color: #006400; font-weight: bold; text-align: right; margin-top: 20px; }
            .footer { margin-top: 40px; text-align: center; font-size: 14px; color: #555; line-height: 1.5; border-top: 2px solid #800000; padding-top: 10px; }
            .print-btn { display: block; width: 160px; margin: 20px auto; background: #800000; color: white; padding: 10px; border: none; border-radius: 6px; cursor: pointer; }
            @media print { .print-btn { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Sarh Al-Manamah Hotel No. (5)</h1>
            <h2>Ajyad Al-Masafi, Near Zuwar Al Bait Hotel, Makkah</h2>
            <h2>📞 0538035356 | ☎️ 012/5353600</h2>
            <h2>✉️ sarhalmanama@gmail.com</h2>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>

          <table class="details">
            <tr><th>Guest Name</th><td>${b.name}</td></tr>
            <tr><th>Phone Number</th><td>${b.phone_number}</td></tr>
            <tr><th>Booked Rooms</th><td>${getRoomDetails(b.selected_rooms)}</td></tr>
            <tr><th>Check-In Date</th><td>${b.check_in_date}</td></tr>
            <tr><th>Check-In Time</th><td>${b.check_in_time}</td></tr>
            <tr><th>Check-Out Date</th><td>${b.check_out_date}</td></tr>
            <tr><th>Booking ID</th><td>#${b.id}</td></tr>
          </table>

          <div class="amount">Total Amount: ₹${b.amount}</div>

          <button class="print-btn" onclick="window.print()">🖨️ Print Receipt</button>

          <div class="footer">
            <p>Thank you for choosing Sarh Al-Manamah Hotel.</p>
            <p>We wish you a pleasant stay and safe journey.</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadBookingPDF = (b) => {
    const doc = new jsPDF("p", "mm", "a4");

    doc.setFontSize(20);
    doc.setTextColor(128, 0, 0);
    doc.text("Sarh Al-Manamah Hotel No. (5)", 105, 15, { align: "center" });

    doc.setFontSize(12);
    doc.text("Ajyad Al-Masafi, Near Zuwar Al Bait Hotel, Makkah", 105, 22, {
      align: "center",
    });
    doc.text("📞 0538035356 | ☎️ 012/5353600", 105, 28, { align: "center" });
    doc.text("✉️ sarhalmanama@gmail.com", 105, 34, { align: "center" });

    autoTable(doc, {
      startY: 60,
      theme: "grid",
      headStyles: { fillColor: [128, 0, 0] },
      body: [
        ["Guest Name", b.name],
        ["Phone Number", b.phone_number],
        ["Booked Rooms", getRoomDetails(b.selected_rooms)],
        ["Check-In Date", b.check_in_date],
        ["Check-In Time", b.check_in_time],
        ["Check-Out Date", b.check_out_date],
        ["Amount", `₹${b.amount}`],
      ],
    });

    doc.save(`${b.name}_Booking.pdf`);
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
              <td className="px-4 py-2">{b.check_in_time}</td>
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
                <button
                  onClick={() => handlePrintBooking(b)}
                  className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                >
                  🖨️ Print
                </button>
                <button
                  onClick={() => handleDownloadBookingPDF(b)}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  ⬇️ PDF
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
