import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Layout } from "@/components/Layout";

/* ================= TYPES ================= */

interface EventInfo {
  id: number;
  title: string;
  location: string;
}

interface EventSlot {
  id: number;
  event_date: string;
  start_time: string;
  end_time: string;
  seats_left: number;
  price: number;          
  status: "open" | "sold_out";
}


/* ================= COMPONENT ================= */

const EventBooking = () => {
  const { eventId } = useParams();

  const [event, setEvent] = useState<EventInfo | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<EventSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<EventSlot | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [view, setView] = useState<"calendar" | "list">("calendar");

  /* ================= HELPER FUNCTION ================= */

  // ✅ Format date like: Mon Jan 12 2026
const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ✅ Convert 24h → 12h (13:00 -> 1:00 PM)
const formatTime12h = (time: string) => {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const hour = h % 12 || 12;
  const ampm = h >= 12 ? "PM" : "AM";
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
};


  /* ================= LOAD EVENT ================= */

  useEffect(() => {
    if (!eventId) return;

    axios
      .get(`http://localhost:5000/api/events/${eventId}`)
      .then((res) => {
        setEvent(res.data.data);
        setAvailableDates(
        res.data.data.available_dates.map((d: string) =>
            d.split("T")[0]
        )
        );

      })
      .catch(console.error);
  }, [eventId]);

  /* ================= LOAD SLOTS ================= */

  useEffect(() => {
    if (!eventId || !selectedDate) return;

    axios
      .get(`http://localhost:5000/api/events/${eventId}/slots`, {
        params: { date: selectedDate },
      })
      .then((res) => {
        setSlots(res.data.data);
        setSelectedSlot(null); // reset slot when date changes
      })
      .catch(console.error);
  }, [eventId, selectedDate]);

  /* ================= PROCEED ================= */

const handleProceed = async () => {
  if (!selectedSlot || !selectedDate) return;

  const token = localStorage.getItem("token");

  // 🔐 Not logged in
  if (!token) {
    localStorage.setItem(
      "pendingEventBooking",
      JSON.stringify({
        eventId,
        slotId: selectedSlot.id,
        quantity,
      })
    );
    window.location.href = "/register";
    return;
  }

  try {
    // 1️⃣ CREATE RAZORPAY ORDER (NO payment data here)
    const orderRes = await axios.post(
      "http://localhost:5000/api/events/payments/razorpay/order",
      {
        eventId,
        slotId: selectedSlot.id,
        quantity,
        amount: selectedSlot.price * quantity,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const { orderId, amount, currency, key } = orderRes.data.data;

    // 2️⃣ OPEN RAZORPAY
    const options = {
      key,
      amount,
      currency,
      name: "SportHub",
      description: "Event Booking",
      order_id: orderId,

      handler: async function (response: any) {
        // 3️⃣ VERIFY PAYMENT + CREATE BOOKING
        await axios.post(
          "http://localhost:5000/api/events/payments/razorpay/verify",
          {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,

            bookingData: {
              eventId,
              slotId: selectedSlot.id,
              date: selectedDate,
              startTime: selectedSlot.start_time,
              endTime: selectedSlot.end_time,
              quantity,
              amount: selectedSlot.price * quantity,
            },
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        alert("🎉 Booking Confirmed!");
        window.location.href = "/profile?tab=events";
      },

      theme: { color: "#f97316" },
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  } catch (err) {
    console.error(err);
    alert("Payment failed");
  }
};


  /* ================= UI ================= */

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        {/* HEADER */}
        <h1 className="text-2xl font-bold mb-1">{event?.title}</h1>
        <p className="text-muted-foreground mb-6">{event?.location}</p>

        {/* VIEW TOGGLE */}
        <div className="flex justify-end gap-2 mb-6">
          <button
            onClick={() => setView("calendar")}
            className={`px-3 py-2 border rounded ${
              view === "calendar" ? "bg-black text-white" : ""
            }`}
          >
            📅
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-3 py-2 border rounded ${
              view === "list" ? "bg-black text-white" : ""
            }`}
          >
            ☰
          </button>
        </div>

        {/* DATE SELECT */}
        {view === "list" && (
          <div className="flex gap-3 overflow-x-auto mb-6">
            {availableDates.map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`px-4 py-2 rounded-lg border whitespace-nowrap ${
                  selectedDate === date ? "bg-black text-white" : ""
                }`}
              >
                {new Date(date).toDateString()}
              </button>
            ))}
          </div>
        )}

        {view === "calendar" && (
          <div className="grid grid-cols-7 gap-2 mb-6">
            {availableDates.map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`p-3 border rounded text-sm ${
                  selectedDate === date ? "bg-black text-white" : ""
                }`}
              >
                {new Date(date).getDate()}
              </button>
            ))}
          </div>
        )}

        {/* SLOTS */}
        {selectedDate && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              {new Date(selectedDate + "T00:00:00").toDateString()}
            </h2>

            {slots.length === 0 && (
              <p className="text-muted-foreground">No slots available</p>
            )}

            {slots.map((slot) => (
              <div
                key={slot.id}
                className="flex justify-between items-center border p-4 rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    {formatTime12h(slot.start_time)} – {formatTime12h(slot.end_time)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ₹{slot.price} • {slot.seats_left} seats left
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {slot.seats_left} seats left
                  </p>
                </div>

                <button
                  disabled={slot.status === "sold_out" || slot.seats_left === 0}
                  onClick={() => {
                    if (selectedSlot?.id === slot.id) {
                        // 🔁 deselect if clicked again
                        setSelectedSlot(null);
                    } else {
                        setSelectedSlot(slot);
                        setQuantity(1);
                    }
                    }}
                  className={`px-4 py-2 rounded transition ${
                    selectedSlot?.id === slot.id
                        ? "bg-orange-500 text-white ring-2 ring-orange-300"
                        : "bg-black text-white"
                    } disabled:opacity-40`}

                >
                  BOOK
                </button>
              </div>
            ))}

            {/* ================= BOOKING SUMMARY ================= */ }
            {selectedSlot && (
              <div className="mt-6 border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-lg">Booking Summary</h3>
                <p>
                  <strong>Event:</strong> {event?.title}
                </p>

                <p>
                  <strong>Date:</strong>{" "}
                  {formatDate(selectedSlot.event_date)}
                </p>

                <p>
                  <strong>Time:</strong>{" "}
                  {formatTime12h(selectedSlot.start_time)} –{" "}
                  {formatTime12h(selectedSlot.end_time)}
                </p>

                <p>
                  <strong>Price per seat:</strong> ₹{selectedSlot.price}
                </p>
                <div className="flex items-center gap-3">
                  <label className="font-medium">Seats:</label>
                  <div className="flex items-center gap-2">
                    <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-8 h-8 rounded bg-gray-200 text-lg font-bold"
                        >
                        −
                        </button>
                        <div className="w-12 text-center border rounded py-1">
                        {quantity}
                        </div>

                        <button
                        onClick={() => setQuantity((q) => Math.min(3, q + 1))}
                        className="w-8 h-8 rounded bg-gray-200 text-lg font-bold"
                        >
                        +
                        </button>
                        <span className="text-sm text-muted-foreground ml-2">
                        (Max 3 per slot)
                        <p className="text-lg font-semibold">
                          Total: ₹{selectedSlot.price * quantity}
                        </p>
                    </span>
                  </div>
                </div>

                <button
                  className="w-full bg-black text-white py-2 rounded"
                  onClick={handleProceed}
                >
                  Proceed to Pay
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EventBooking;
