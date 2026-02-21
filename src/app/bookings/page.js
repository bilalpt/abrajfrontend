// "use client";

// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import PptxGenJS from "pptxgenjs";
// import { saveAs } from "file-saver";

// const API_BASE = "https://abrajbackend.onrender.com";

// // ✅ Room Data with bed counts
// const roomsData = {
//   5: {
//     501: 4, 502: 4, 503: 4, 504: 3, 505: 4, 506: 4, 507: 4, 508: 4, 509: 4,
//     510: 4, 511: 4, 512: 4, 513: 3, 514: 2, 515: 2, 516: 3, 517: 4, 518: 4,
//   },
//   6: {
//     601: 4, 602: 4, 603: 4, 604: 3, 605: 4, 606: 4, 607: 4, 608: 4, 609: 4,
//     610: 4, 611: 4, 612: 4, 613: 3, 614: 2, 615: 2, 616: 3, 617: 4, 618: 4,
//   },
//   8: {
//     801: 4, 802: 4, 803: 4, 804: 4, 805: 4, 806: 4, 807: 4, 808: 4, 809: 4,
//     810: 4, 811: 3, 812: 2, 813: 2, 814: 3, 815: 4, 816: 4,
//   },
//   9: {
//     901: 4, 902: 4, 903: 4, 904: 4, 905: 4, 906: 4,
//   },
// };

// const Bookings = () => {
//   const [bookings, setBookings] = useState([]);
//   const router = useRouter();

//   // Global filter states
//   const [searchTerm, setSearchTerm] = useState("");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [roomFilter, setRoomFilter] = useState(""); // '' means All

//   useEffect(() => {
//     fetchBookings();
//   }, []);

//   const fetchBookings = async () => {
//     try {
//       const res = await fetch(`${API_BASE}/api/bookings/`);
//       const data = await res.json();
//       const sorted = data.sort((a, b) => b.id - a.id);
//       setBookings(sorted);
//     } catch (error) {
//       console.error("Error fetching bookings:", error);
//     }
//   };

//   // helper: normalize date string to YYYY-MM-DD (if falsy return "")
//   const normalize = (dateStr) =>
//     dateStr ? new Date(dateStr).toISOString().split("T")[0] : "";

//   const normalizeDateTime = (datetimeStr) =>
//     datetimeStr ? new Date(datetimeStr).toISOString().split("T")[0] : "";

//   // Room details formatter
//   const getRoomDetails = (roomString) => {
//     if (!roomString) return "-";
//     const rooms = roomString.toString().split(",").map((r) => r.trim());
//     return rooms
//       .map((r) => {
//         const floor = r[0];
//         const beds =
//           roomsData[floor] && roomsData[floor][r] ? roomsData[floor][r] : "?";
//         return `${r} (${beds} beds)`;
//       })
//       .join(", ");
//   };

//   // Build list of unique room numbers from all bookings (for dropdown)
//   const getAllRooms = () => {
//     const roomSet = new Set();
//     bookings.forEach((b) => {
//       if (!b.selected_rooms) return;
//       b.selected_rooms
//         .toString()
//         .split(",")
//         .map((r) => r.trim())
//         .forEach((r) => {
//           if (r) roomSet.add(r);
//         });
//     });
//     // return sorted array (numeric sort if possible)
//     return Array.from(roomSet).sort((a, b) => {
//       const na = Number(a);
//       const nb = Number(b);
//       if (!isNaN(na) && !isNaN(nb)) return na - nb;
//       return a.localeCompare(b);
//     });
//   };

//   // ---------- Filtering logic (global) ----------
//   const applyFilters = () => {
//     const term = searchTerm.trim().toLowerCase();

//     return bookings.filter((b) => {
//       // If room filter selected: ensure selected_rooms (comma list) contains it
//       if (roomFilter) {
//         const roomsStr = (b.selected_rooms || "").toString().toLowerCase();
//         if (!roomsStr.split(",").map(r => r.trim()).includes(roomFilter.toLowerCase())) {
//           return false;
//         }
//       }

//       // Date filter: check_in_date within from-to (inclusive)
//       const checkIn = normalize(b.check_in_date);
//       if (fromDate) {
//         if (!checkIn || checkIn < fromDate) return false;
//       }
//       if (toDate) {
//         if (!checkIn || checkIn > toDate) return false;
//       }

//       // Search term across multiple fields (name, phone, room string, amount, check_in_date)
//       if (!term) return true; // no search term, passed earlier filters already

//       const name = (b.name || "").toString().toLowerCase();
//       const phone = (b.phone_number || "").toString().toLowerCase();
//       const amount = (b.amount || "").toString().toLowerCase();
//       const selectedRooms = (b.selected_rooms || "").toString().toLowerCase();
//       const roomDetails = getRoomDetails(b.selected_rooms).toLowerCase();
//       const checkInDate = (b.check_in_date || "").toString().toLowerCase();
//       const checkOutDate = (b.check_out_date || "").toString().toLowerCase();

//       return (
//         name.includes(term) ||
//         phone.includes(term) ||
//         amount.includes(term) ||
//         selectedRooms.includes(term) ||
//         roomDetails.includes(term) ||
//         checkInDate.includes(term) ||
//         checkOutDate.includes(term)
//       );
//     });
//   };

//   const filteredBookings = applyFilters();

//   // Today's date for sections
//   const today = new Date().toISOString().split("T")[0];

//   // Split filtered bookings into sections
//   const todayBookings = filteredBookings.filter(
//     (b) =>
//       normalize(b.check_in_date) === today ||
//       normalizeDateTime(b.created_at) === today
//   );

//   const upcomingBookings = filteredBookings.filter(
//     (b) => normalize(b.check_in_date) > today
//   );

//   const previousBookings = filteredBookings.filter(
//     (b) => normalize(b.check_in_date) < today
//   );

//   // Totals
//   const totalAmountToday = todayBookings.reduce(
//     (sum, b) => sum + parseFloat(b.amount || 0),
//     0
//   );
//   const grandTotal = filteredBookings.reduce(
//     (sum, b) => sum + parseFloat(b.amount || 0),
//     0
//   );

//   // Print / PDF helpers (unchanged logic)
//   const handlePrint = () => window.print();

//   const handlePrintTotal = () => {
//     const printWindow = window.open("", "_blank");
//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>Grand Total Report</title>
//           <style>
//             body { font-family: Arial, sans-serif; margin: 40px; color: #333; background: #fff; }
//             h1 { text-align: center; color: #800000; margin-bottom: 30px; }
//             table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
//             th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
//             th { background-color: #f8f8f8; color: #222; }
//             .total { text-align: right; font-size: 18px; font-weight: bold; color: #006400; margin-top: 20px; }
//             .print-btn { display: block; width: 160px; margin: 20px auto; background: #800000; color: white; padding: 10px; border: none; border-radius: 6px; cursor: pointer; }
//             @media print { .print-btn { display: none; } }
//           </style>
//         </head>
//         <body>
//           <h1>Hotel Grand Total Report</h1>
//           <table>
//             <tr><th>Total Bookings (filtered)</th><td>${filteredBookings.length}</td></tr>
//             <tr><th>Grand Total Amount</th><td>₹${grandTotal.toFixed(2)}</td></tr>
//           </table>
//           <button class="print-btn" onclick="window.print()">🖨️ Print</button>
//         </body>
//       </html>
//     `);
//     printWindow.document.close();
//   };

//   const handleDownloadTotalPDF = () => {
//     const doc = new jsPDF("p", "mm", "a4");
//     doc.setFontSize(20);
//     doc.setTextColor(128, 0, 0);
//     doc.text("Hotel Grand Total Report", 105, 20, { align: "center" });

//     autoTable(doc, {
//       startY: 40,
//       theme: "grid",
//       headStyles: { fillColor: [128, 0, 0] },
//       body: [
//         ["Total Bookings (filtered)", filteredBookings.length.toString()],
//         ["Grand Total Amount", `₹${grandTotal.toFixed(2)}`],
//       ],
//     });

//     doc.save("Grand_Total_Report.pdf");
//   };

//   // Clear filters
//   const clearFilters = () => {
//     setSearchTerm("");
//     setFromDate("");
//     setToDate("");
//     setRoomFilter("");
//   };

//   // Get room options for dropdown
//   const roomOptions = getAllRooms();

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-6 flex-wrap">
//         <h2 className="text-2xl font-bold text-gray-800">🧾 All Bookings</h2>

//         <div className="flex flex-wrap gap-3">
//           <button
//             onClick={handlePrint}
//             className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
//           >
//             🖨️ Print All
//           </button>
//           <button
//             onClick={() => router.push("/payment")}
//             className="bg-[#1b426c] text-white px-4 py-2 rounded-lg hover:bg-[#20aaea] transition"
//           >
//             Payment Details
//           </button>
//           <button
//             onClick={() => router.push("/")}
//             className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
//           >
//             ← Back to Home
//           </button>
//         </div>
//       </div>

//       {/* ---------------- Global Filter Bar (Option B) ---------------- */}
//       <div className="bg-white rounded-xl shadow p-4 mb-6">
//         <div className="flex flex-col md:flex-row md:items-end gap-3">
//           <div className="flex items-center gap-2 w-full md:w-1/3">
//             <label className="sr-only">Search</label>
//             <input
//               type="text"
//               placeholder="Search name, phone, room, amount..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full border px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           <div className="flex items-center gap-2 w-full md:w-1/4">
//             <label className="sr-only">From</label>
//             <input
//               type="date"
//               value={fromDate}
//               onChange={(e) => setFromDate(e.target.value)}
//               className="w-full border px-3 py-2 rounded-lg"
//             />
//           </div>

//           <div className="flex items-center gap-2 w-full md:w-1/4">
//             <label className="sr-only">To</label>
//             <input
//               type="date"
//               value={toDate}
//               onChange={(e) => setToDate(e.target.value)}
//               className="w-full border px-3 py-2 rounded-lg"
//             />
//           </div>

//           <div className="flex items-center gap-2 w-full md:w-1/6">
//             <select
//               value={roomFilter}
//               onChange={(e) => setRoomFilter(e.target.value)}
//               className="w-full border px-3 py-2 rounded-lg"
//             >
//               <option value="">All Rooms</option>
//               {roomOptions.map((r) => (
//                 <option key={r} value={r}>
//                   {r}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="flex gap-2 ml-auto">
//             <button
//               onClick={clearFilters}
//               className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
//             >
//               Clear
//             </button>
//           </div>
//         </div>

//         <div className="mt-2 text-sm text-gray-600">
//           Showing <strong>{filteredBookings.length}</strong> result
//           {filteredBookings.length !== 1 ? "s" : ""} (filtered)
//         </div>
//       </div>

//       {/* ✅ Today's Bookings Section */}
//       <Section
//         title={`📅 Today's Bookings (${today}) — Total ₹${totalAmountToday.toFixed(
//           2
//         )}`}
//         color="text-green-700"
//       >
//         {todayBookings.length > 0 ? (
//           <PaginatedTable
//             bookings={todayBookings}
//             fetchBookings={fetchBookings}
//             getRoomDetails={getRoomDetails}
//           />
//         ) : (
//           <NoData text="No bookings for today" />
//         )}
//       </Section>

//       {/* Upcoming Bookings */}
//       <Section title="🚀 Upcoming Bookings" color="text-blue-700">
//         {upcomingBookings.length > 0 ? (
//           <PaginatedTable
//             bookings={upcomingBookings}
//             fetchBookings={fetchBookings}
//             getRoomDetails={getRoomDetails}
//           />
//         ) : (
//           <NoData text="No upcoming bookings" />
//         )}
//       </Section>

//       {/* Previous Bookings */}
//       <Section title="🕒 Previous Bookings" color="text-gray-800">
//         {previousBookings.length > 0 ? (
//           <PaginatedTable
//             bookings={previousBookings}
//             fetchBookings={fetchBookings}
//             getRoomDetails={getRoomDetails}
//           />
//         ) : (
//           <NoData text="No previous bookings" />
//         )}
//       </Section>

//       {/* ✅ Grand Total Section */}
//       <div className="bg-white rounded-xl shadow-md p-6 mt-10 text-center">
//         <h3 className="text-2xl font-bold text-gray-800 mb-4">
//           💰 Grand Total Amount: ₹{grandTotal.toFixed(2)}
//         </h3>
//         <div className="flex justify-center gap-3">
//           <button
//             onClick={handlePrintTotal}
//             className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
//           >
//             🖨️ Print
//           </button>
//           <button
//             onClick={handleDownloadTotalPDF}
//             className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
//           >
//             ⬇️ Download PDF
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ✅ Section Wrapper
// const Section = ({ title, color, children }) => (
//   <div className="bg-white rounded-xl shadow-md p-6 mb-10 overflow-x-auto">
//     <h3 className={`text-xl font-semibold mb-4 ${color}`}>{title}</h3>
//     {children}
//   </div>
// );

// const NoData = ({ text }) => (
//   <p className="text-center text-gray-500 italic">{text}</p>
// );

// // ✅ Paginated Table (updated: reset to page 1 on bookings change)
// const PaginatedTable = ({ bookings, fetchBookings, getRoomDetails }) => {
//   const router = useRouter();
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   useEffect(() => {
//     // whenever bookings prop changes, reset to first page
//     setCurrentPage(1);
//   }, [bookings]);

//   const totalPages = Math.ceil(bookings.length / itemsPerPage) || 1;
//   const currentBookings = bookings.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
//   const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

//   const handleDelete = async (id) => {
//     if (!confirm("Are you sure you want to delete this booking?")) return;
//     try {
//       await fetch(`${API_BASE}/api/bookings/${id}/`, { method: "DELETE" });
//       alert("Booking deleted successfully");
//       fetchBookings();
//     } catch (error) {
//       console.error("Error deleting booking:", error);
//     }
//   };

//   const handleEdit = (id) => router.push(`/bookingeditpage/${id}`);

//   const handlePrintBooking = (b) => {
//     const printWindow = window.open("", "_blank");

//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>Booking Receipt - ${b.name}</title>
//           <style>
//             body { font-family: Arial, sans-serif; margin: 40px; color: #333; background: #fff; }
//             .header { text-align: center; border-bottom: 3px solid #800000; padding-bottom: 10px; }
//             .header h1 { margin: 0; color: #800000; font-size: 22px; font-weight: bold; }
//             .header h2 { margin: 2px 0; font-size: 15px; color: #444; }
//             .details { width: 100%; border-collapse: collapse; margin-top: 20px; }
//             .details th, .details td { text-align: left; padding: 10px; border-bottom: 1px solid #ddd; }
//             .details th { background: #f8f8f8; width: 220px; color: #222; }
//             .amount { font-size: 18px; color: #006400; font-weight: bold; text-align: right; margin-top: 20px; }
//             .footer { margin-top: 40px; text-align: center; font-size: 14px; color: #555; line-height: 1.5; border-top: 2px solid #800000; padding-top: 10px; }
//             .print-btn { display: block; width: 160px; margin: 20px auto; background: #800000; color: white; padding: 10px; border: none; border-radius: 6px; cursor: pointer; }
//             @media print { .print-btn { display: none; } }
//           </style>
//         </head>
//         <body>
//           <div class="header">
//             <h1>Sarh Al-Manamah Hotel No. (5)</h1>
//             <h2>Ajyad Al-Masafi, Near Zuwar Al Bait Hotel, Makkah</h2>
//             <h2>📞 0538035356 | ☎️ 012/5353600</h2>
//             <h2>✉️ sarhalmanama@gmail.com</h2>
//             <p>Date: ${new Date().toLocaleDateString()}</p>
//           </div>

//           <table class="details">
//             <tr><th>Guest Name</th><td>${b.name}</td></tr>
//             <tr><th>Phone Number</th><td>${b.phone_number}</td></tr>
//             <tr><th>Booked Rooms</th><td>${getRoomDetails(b.selected_rooms)}</td></tr>
//             <tr><th>Check-In Date</th><td>${b.check_in_date}</td></tr>
//             <tr><th>Check-In Time</th><td>${b.check_in_time}</td></tr>
//             <tr><th>Check-Out Date</th><td>${b.check_out_date}</td></tr>
//             <tr><th>Booking ID</th><td>#${b.id}</td></tr>
//           </table>

//           <div class="amount">Total Amount: ₹${b.amount}</div>

//           <button class="print-btn" onclick="window.print()">🖨️ Print Receipt</button>

//           <div class="footer">
//             <p>Thank you for choosing Sarh Al-Manamah Hotel.</p>
//             <p>We wish you a pleasant stay and safe journey.</p>
//           </div>
//         </body>
//       </html>
//     `);
//     printWindow.document.close();
//   };

//   const handleDownloadBookingPDF = (b) => {
//     const doc = new jsPDF("p", "mm", "a4");

//     doc.setFontSize(20);
//     doc.setTextColor(128, 0, 0);
//     doc.text("Sarh Al-Manamah Hotel No. (5)", 105, 15, { align: "center" });

//     doc.setFontSize(12);
//     doc.text("Ajyad Al-Masafi, Near Zuwar Al Bait Hotel, Makkah", 105, 22, {
//       align: "center",
//     });
//     doc.text("📞 0538035356 | ☎️ 012/5353600", 105, 28, { align: "center" });
//     doc.text("✉️ sarhalmanama@gmail.com", 105, 34, { align: "center" });

//     autoTable(doc, {
//       startY: 60,
//       theme: "grid",
//       headStyles: { fillColor: [128, 0, 0] },
//       body: [
//         ["Guest Name", b.name],
//         ["Phone Number", b.phone_number],
//         ["Booked Rooms", getRoomDetails(b.selected_rooms)],
//         ["Check-In Date", b.check_in_date],
//         ["Check-In Time", b.check_in_time],
//         ["Check-Out Date", b.check_out_date],
//         ["Amount", `₹${b.amount}`],
//       ],
//     });

//     doc.save(`${b.name}_Booking.pdf`);
//   };

//   return (
//     <>
//       <table className="min-w-full text-sm text-left text-gray-600">
//         <thead className="bg-gray-200 text-gray-800">
//           <tr>
//             <th className="px-4 py-2">Name</th>
//             <th className="px-4 py-2">Phone</th>
//             <th className="px-4 py-2">Rooms (Beds)</th>
//             <th className="px-4 py-2">Check-In Date</th>
//             <th className="px-4 py-2">Check-In Time</th>
//             <th className="px-4 py-2">Check-Out</th>
//             <th className="px-4 py-2">Amount</th>
//             <th className="px-4 py-2 text-center">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {currentBookings.map((b, i) => (
//             <tr key={i} className="border-b hover:bg-gray-50">
//               <td className="px-4 py-2 align-middle">{b.name}</td>
//               <td className="px-4 py-2 align-middle">{b.phone_number}</td>
//               <td className="px-4 py-2 align-middle">
//                 {getRoomDetails(b.selected_rooms)}
//               </td>
//               <td className="px-4 py-2 align-middle">{b.check_in_date}</td>
//               <td className="px-4 py-2 align-middle">{b.check_in_time}</td>
//               <td className="px-4 py-2 align-middle">{b.check_out_date}</td>
//               <td className="px-4 py-2 font-semibold text-green-700 align-middle">
//                 ₹{b.amount}
//               </td>
//               <td className="px-4 py-2 text-center space-x-1 align-middle">
//                 <button
//                   onClick={() => router.push(`/bookingeditpage/${b.id}`)}
//                   className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
//                 >
//                   Edit
//                 </button>
//                 <button
//                   onClick={() => handleDelete(b.id)}
//                   className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
//                 >
//                   Delete
//                 </button>
//                 <button
//                   onClick={() => handlePrintBooking(b)}
//                   className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
//                 >
//                   🖨️ Print
//                 </button>
//                 <button
//                   onClick={() => handleDownloadBookingPDF(b)}
//                   className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
//                 >
//                   ⬇️ PDF
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {totalPages > 1 && (
//         <div className="flex justify-center items-center mt-4 space-x-2">
//           <button
//             onClick={handlePrev}
//             disabled={currentPage === 1}
//             className={`px-3 py-1 rounded-lg border text-sm ${currentPage === 1
//                 ? "text-gray-400 border-gray-300 cursor-not-allowed"
//                 : "text-gray-700 border-gray-400 hover:bg-gray-100"
//               }`}
//           >
//             Prev
//           </button>
//           <span className="text-gray-600">
//             Page {currentPage} of {totalPages}
//           </span>
//           <button
//             onClick={handleNext}
//             disabled={currentPage === totalPages}
//             className={`px-3 py-1 rounded-lg border text-sm ${currentPage === totalPages
//                 ? "text-gray-400 border-gray-300 cursor-not-allowed"
//                 : "text-gray-700 border-gray-400 hover:bg-gray-100"
//               }`}
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </>
//   );
// };

// export default Bookings;
