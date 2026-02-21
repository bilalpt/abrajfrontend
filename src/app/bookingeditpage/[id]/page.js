"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_BASE = "https://abrajbackend.onrender.com";

// ROOM DATA (same as booking form)
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

const EditBookingPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allBookings, setAllBookings] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchBooking();
    fetchAllBookings();
  }, [id]);

  // Fetch Booking Details
  const fetchBooking = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${id}/`);
      const data = await res.json();
      setBooking(data);
    } catch (error) {
      console.error("Error loading booking:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all bookings for checking room conflicts
  const fetchAllBookings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings/`);
      const data = await res.json();
      setAllBookings(data);
    } catch (error) {
      console.error("Error fetching all bookings:", error);
    }
  };

  // 🔍 CHECK IF ROOM EXISTS IN roomsData
  const roomExists = (room) => {
    room = room.trim();
    for (let floor in roomsData) {
      if (roomsData[floor][room]) return true;
    }
    return false;
  };

  // 🔍 CHECK IF ROOM ALREADY BOOKED
  const isRoomBooked = (room) => {
    if (!booking) return false;

    const newCheckIn = new Date(booking.check_in_date);
    const newCheckOut = new Date(booking.check_out_date);

    return allBookings.some((b) => {
      if (b.id === booking.id) return false; // skip same booking
      if (!b.selected_rooms) return false;

      const rooms = b.selected_rooms.split(",").map((r) => r.trim());
      if (!rooms.includes(room)) return false;

      const existingCheckIn = new Date(b.check_in_date);
      const existingCheckOut = new Date(b.check_out_date);

      return newCheckIn < existingCheckOut && newCheckOut > existingCheckIn;
    });
  };

  // SAVE / UPDATE BOOKING
  const handleUpdate = async () => {
    if (!booking.name || !booking.phone_number || !booking.check_in_date) {
      setMessage("❌ All fields are required.");
      return;
    }

    // Convert rooms to array
    const selectedRooms = booking.selected_rooms
      ?.split(",")
      .map((r) => r.trim());

    // 1️⃣ VALIDATE ROOM EXISTS
    for (let room of selectedRooms) {
      if (!roomExists(room)) {
        setMessage(`❌ Room ${room} does not exist. Please enter a valid room.`);
        return;
      }
    }

    // 2️⃣ VALIDATE NOT BOOKED BY OTHERS
    for (let room of selectedRooms) {
      if (isRoomBooked(room)) {
        setMessage(`❌ Room ${room} is already booked for this date.`);
        return;
      }
    }

    // 3️⃣ UPDATE API CALL
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking),
      });

      if (res.ok) {
        setMessage("✅ Booking Updated Successfully!");
        setTimeout(() => router.push("/bookings"), 1500);
      } else {
        setMessage("❌ Update Failed.");
      }
    } catch (err) {
      setMessage("⚠️ Server Error");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-blue-600 text-lg">
        Loading booking...
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <button
        onClick={() => router.push("/bookings")}
        className="mb-4 text-gray-600 hover:text-black"
      >
        ← Back
      </button>

      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        ✏️ Edit Booking
      </h2>

      <div className="bg-white rounded-xl shadow-md p-6 max-w-3xl mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdate();
          }}
          className="space-y-5"
        >
          <div>
            <label className="font-medium">Guest Name</label>
            <input
              type="text"
              value={booking.name}
              onChange={(e) => setBooking({ ...booking, name: e.target.value })}
              className="w-full bg-gray-100 p-3 rounded"
            />
          </div>

          <div>
            <label className="font-medium">Phone Number</label>
            <input
              type="text"
              value={booking.phone_number}
              onChange={(e) =>
                setBooking({ ...booking, phone_number: e.target.value })
              }
              className="w-full bg-gray-100 p-3 rounded"
            />
          </div>

          <div>
            <label className="font-medium">
              Selected Rooms (comma separated)
            </label>
            <input
              type="text"
              value={booking.selected_rooms}
              onChange={(e) =>
                setBooking({ ...booking, selected_rooms: e.target.value })
              }
              className="w-full bg-gray-100 p-3 rounded"
            />
          </div>

          <div>
            <label className="font-medium">Check-In Date</label>
            <input
              type="date"
              value={booking.check_in_date}
              onChange={(e) =>
                setBooking({ ...booking, check_in_date: e.target.value })
              }
              className="w-full bg-gray-100 p-3 rounded"
            />
          </div>

          <div>
            <label className="font-medium">Check-Out Date</label>
            <input
              type="date"
              value={booking.check_out_date}
              onChange={(e) =>
                setBooking({ ...booking, check_out_date: e.target.value })
              }
              className="w-full bg-gray-100 p-3 rounded"
            />
          </div>

          <div>
            <label className="font-medium">Amount (₹)</label>
            <input
              type="number"
              value={booking.amount}
              onChange={(e) =>
                setBooking({ ...booking, amount: e.target.value })
              }
              className="w-full bg-gray-100 p-3 rounded"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-3 rounded-lg mt-4 hover:bg-red-700"
          >
            💾 Update Booking
          </button>

          {message && (
            <p
              className={`text-center mt-3 font-medium ${
                message.startsWith("✅") ? "text-green-700" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditBookingPage;
