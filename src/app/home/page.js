"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

const Homepage = () => {
  const router = useRouter();
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [bookedRooms, setBookedRooms] = useState([]);
  const [allBookings, setAllBookings] = useState([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [checkInTime, setCheckInTime] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  // ✅ Base API URL (LIVE)
  const BASE_URL = "https://abrajbackend.onrender.com";

  // ✅ Fetch bookings
  const fetchBookedRooms = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/bookings/`);
      const data = await res.json();
      setAllBookings(data);

      const today = new Date().toISOString().split("T")[0];
      const validBookings = data.filter(
        (b) =>
          (b.check_in_date <= today && b.check_out_date >= today) ||
          b.check_in_date === today
      );

      const booked = validBookings.flatMap((booking) =>
        booking.selected_rooms.split(",").map((r) => r.trim()).filter(Boolean)
      );

      setBookedRooms(booked.map(Number));
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  useEffect(() => {
    fetchBookedRooms();
    const interval = setInterval(fetchBookedRooms, 60000);
    return () => clearInterval(interval);
  }, []);

  const toggleRoomSelection = (room) => {
    setSelectedRooms((prev) =>
      prev.includes(room) ? prev.filter((r) => r !== room) : [...prev, room]
    );
  };

  const totalBeds = selectedRooms.reduce((sum, room) => {
    for (const floor in roomsData) {
      if (roomsData[floor][room]) return sum + roomsData[floor][room];
    }
    return sum;
  }, 0);

  // ✅ Check for overlapping bookings
  const hasDateConflict = () => {
    if (!checkInDate || !checkOutDate || selectedRooms.length === 0)
      return false;

    const newStart = new Date(checkInDate);
    const newEnd = new Date(checkOutDate);

    for (const booking of allBookings) {
      const bookedStart = new Date(booking.check_in_date);
      const bookedEnd = new Date(booking.check_out_date);
      const bookedRoomList = booking.selected_rooms
        .split(",")
        .map((r) => r.trim());

      const isOverlap = newStart <= bookedEnd && newEnd >= bookedStart;
      const hasSameRoom = selectedRooms.some((r) =>
        bookedRoomList.includes(String(r))
      );

      if (isOverlap && hasSameRoom) {
        return booking;
      }
    }

    return null;
  };

  const handleSubmit = async () => {
    const conflict = hasDateConflict();
    if (conflict) {
      setMessage(
        `⚠️ Conflict detected! Room(s) already booked from ${conflict.check_in_date} to ${conflict.check_out_date}.`
      );
      return;
    }

    const bookingData = {
      selected_rooms: selectedRooms.join(", "),
      name,
      phone_number: phone,
      check_in_time: checkInTime,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      amount,
    };

    try {
      const res = await fetch(`${BASE_URL}/api/bookings/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (res.ok) {
        setMessage("✅ Booking successful!");
        setSelectedRooms([]);
        setName("");
        setPhone("");
        setCheckInTime("");
        setCheckInDate("");
        setCheckOutDate("");
        setAmount("");
        fetchBookedRooms();
      } else {
        setMessage("❌ Booking failed. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("⚠️ Server error. Check your backend.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 p-6 bg-gray-50 min-h-screen">
      {/* LEFT SIDE */}
      <div className="flex-1 bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Click on available rooms to reserve your bed
        </h2>

        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-md">
            🏢
          </div>
          <p className="ml-3 font-semibold text-gray-600">Building</p>
          <p
            onClick={() => router.push("/bookings")}
            className="ml-10 font-semibold text-gray-600 cursor-pointer hover:text-red-600"
          >
            View Bookings
          </p>
        </div>

        {/* FLOORS */}
        <div className="flex flex-col gap-8">
          {Object.keys(roomsData).map((floor) => (
            <div key={floor}>
              <h3 className="font-semibold mb-3 text-lg text-gray-700">
                Floor {floor}
              </h3>
              <div className="grid grid-cols-6 md:grid-cols-9 gap-4 place-items-center">
                {Object.entries(roomsData[floor]).map(([room, beds]) => {
                  const isSelected = selectedRooms.includes(Number(room));
                  const isBooked = bookedRooms.includes(Number(room));

                  return (
                    <button
                      key={room}
                      onClick={() =>
                        !isBooked && toggleRoomSelection(Number(room))
                      }
                      disabled={isBooked}
                      className={`w-12 h-12 rounded-lg border font-bold text-sm transition-all duration-200 flex flex-col items-center justify-center shadow-sm
                        ${
                          isBooked
                            ? "bg-red-500 text-white cursor-not-allowed"
                            : isSelected
                            ? "bg-yellow-400 text-black border-gray-700 scale-105 shadow-md"
                            : "bg-gray-200 text-black hover:bg-gray-300"
                        }`}
                    >
                      <span>{room}</span>
                      <span className="text-[10px] font-semibold text-gray-600">
                        {beds}🛏
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* LEGEND */}
        <div className="flex justify-center gap-8 mt-10 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 border border-gray-400 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 border border-gray-700 rounded"></div>
            <span>Selected</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - FORM */}
      <div className="w-full md:w-1/3 bg-white p-6 rounded-xl shadow-md h-fit">
        <h3 className="text-xl font-semibold border-b pb-3 mb-4">
          Your Selection
        </h3>

        <div className="space-y-4">
          {/* SELECTED ROOMS */}
          <div>
            <p className="text-gray-700 mb-2 font-medium">Selected Rooms:</p>
            {selectedRooms.length > 0 ? (
              <>
                <div className="bg-gray-100 rounded-lg p-3 text-gray-800 text-sm">
                  {selectedRooms.join(", ")}
                </div>
                <div className="mt-3 flex justify-between text-sm text-gray-700">
                  <span>🛏 Total Rooms: {selectedRooms.length}</span>
                  <span>🛌 Total Beds: {totalBeds}</span>
                </div>
              </>
            ) : (
              <p className="text-gray-400 italic">No rooms selected</p>
            )}
          </div>

          {/* FORM FIELDS */}
          <div>
            <label className="text-gray-700 mb-2 font-medium block">Name:</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-100 rounded-lg p-3 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="text-gray-700 mb-2 font-medium block">
              Phone Number:
            </label>
            <input
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-gray-100 rounded-lg p-3 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="text-gray-700 mb-2 font-medium block">
              Check-in Time:
            </label>
            <input
              type="time"
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
              className="w-full bg-gray-100 rounded-lg p-3 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="text-gray-700 mb-2 font-medium block">
              Check-in Date:
            </label>
            <input
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="w-full bg-gray-100 rounded-lg p-3 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="text-gray-700 mb-2 font-medium block">
              Check-out Date:
            </label>
            <input
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              className="w-full bg-gray-100 rounded-lg p-3 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="text-gray-700 mb-2 font-medium block">
              Amount:
            </label>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-100 rounded-lg p-3 text-sm focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={
            !name ||
            !phone ||
            selectedRooms.length === 0 ||
            !checkInDate ||
            !checkOutDate ||
            !checkInTime ||
            !amount
          }
          className={`mt-6 w-full py-3 font-semibold rounded-lg transition-colors ${
            !name ||
            !phone ||
            selectedRooms.length === 0 ||
            !checkInDate ||
            !checkOutDate ||
            !checkInTime ||
            !amount
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-red-600 text-white hover:bg-red-700 cursor-pointer"
          }`}
        >
          Proceed to Checkout
        </button>

        {message && (
          <p
            className={`text-center mt-4 text-sm font-medium ${
              message.startsWith("⚠️") || message.startsWith("❌")
                ? "text-red-600"
                : "text-green-700"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Homepage;
