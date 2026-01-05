import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Layout } from "@/components/Layout";
import {
  Calendar,
  List,
  MapPin,
  Clock,
  Users,
  Ticket,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ================= TYPES ================= */

interface EventInfo {
  id: number;
  title: string;
  location: string;
  available_dates: string[];
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
  const [view, setView] = useState<"calendar" | "list">("list");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookingError, setBookingError] = useState<string | null>(null);


  /* ================= HELPERS ================= */

  const formatDate = (dateStr: string) =>
    new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatTime12h = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return {
      firstDay: new Date(year, month, 1).getDay(),
      daysInMonth: new Date(year, month + 1, 0).getDate(),
    };
  };

  /* ================= LOAD EVENT ================= */

  useEffect(() => {
    if (!eventId) return;

    axios
      .get(`http://localhost:5000/api/events/${eventId}`)
      .then((res) => {
        const data = res.data.data;
        setEvent(data);
        setAvailableDates(
          data.available_dates.map((d: string) => d.split("T")[0])
        );
        setSelectedDate(
          data.available_dates?.[0]?.split("T")[0] ?? null
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
        setSelectedSlot(null);
      })
      .catch(console.error);
  }, [eventId, selectedDate]);

  /* ================= PAYMENT ================= */

  const handleProceed = async () => {
    if (!selectedSlot || !selectedDate) return;

    setBookingError(null); // clear previous error

    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.setItem(
        "pendingEventBooking",
        JSON.stringify({ eventId, slotId: selectedSlot.id, quantity })
      );
      window.location.href = "/register";
      return;
    }

    try {
      // 🔴 THIS FAILS WHEN USER EXCEEDS 3 SEATS
      const orderRes = await axios.post(
        "http://localhost:5000/api/events/payments/razorpay/order",
        {
          eventId,
          slotId: selectedSlot.id,
          quantity,
          amount: selectedSlot.price * quantity,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { orderId, amount, currency, key } = orderRes.data.data;

      const razorpay = new (window as any).Razorpay({
        key,
        amount,
        currency,
        name: "SportHub",
        description: "Event Booking",
        order_id: orderId,
        handler: async (response: any) => {
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
            { headers: { Authorization: `Bearer ${token}` } }
          );

          window.location.href = "/profile?tab=events";
        },
        theme: { color: "#ff7a1a" },
      });

      razorpay.open();
    } catch (err: any) {
      // ✅ SHOW BACKEND MESSAGE IN UI
      setBookingError(
        err?.response?.data?.message ||
          "You can book max 3 seats for this slot"
      );
    }
  };


  /* ================= UI ================= */

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* HEADER */}
        <div className="bg-[#fff3ea] border-b">
          <div className="container mx-auto px-6 py-6 max-w-6xl flex gap-4 items-center">
            <div className="w-12 h-12 rounded-xl bg-[#ff7a1a]/10 flex items-center justify-center">
              <Ticket className="text-[#ff7a1a]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{event?.title}</h1>
              <p className="text-muted-foreground flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {event?.location}
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8 max-w-6xl grid lg:grid-cols-[1fr,380px] gap-10">

          {/* LEFT */}
          <div className="space-y-8">

            {/* DATE SELECT */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">Select Date</h2>

                <div className="bg-muted rounded-xl p-1 flex">
                  <button
                    onClick={() => setView("calendar")}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm",
                      view === "calendar" && "bg-background shadow"
                    )}
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setView("list")}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm",
                      view === "list" && "bg-background shadow"
                    )}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* DATE PILLS */}
              {view === "list" && (
                <div className="bg-card border rounded-2xl p-4 flex gap-4 overflow-x-auto">
                  {availableDates.map((date) => {
                    const d = new Date(date + "T00:00:00");
                    const selected = selectedDate === date;

                    return (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={cn(
                          "min-w-[90px] rounded-xl border px-4 py-3 text-center transition",
                          selected
                            ? "bg-[#ff7a1a] text-white border-[#ff7a1a]"
                            : "hover:border-[#ff7a1a]"
                        )}
                      >
                        <div className="text-xs">{d.toLocaleDateString("en-IN", { weekday: "short" })}</div>
                        <div className="text-lg font-bold">{d.getDate()}</div>
                        <div className="text-xs">{d.toLocaleDateString("en-IN", { month: "short" })}</div>
                      </button>
                    );
                  })}
                </div>
              )}
              {/* CALENDAR VIEW */}
              {view === "calendar" && (
                <div className="bg-card border rounded-2xl p-6 max-w-md">
                  {/* Month Header */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() =>
                        setCurrentMonth(
                          new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
                        )
                      }
                      className="p-2 rounded hover:bg-muted"
                    >
                      ‹
                    </button>

                    <h3 className="font-semibold">
                      {currentMonth.toLocaleDateString("en-IN", {
                        month: "long",
                        year: "numeric",
                      })}
                    </h3>

                    <button
                      onClick={() =>
                        setCurrentMonth(
                          new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
                        )
                      }
                      className="p-2 rounded hover:bg-muted"
                    >
                      ›
                    </button>
                  </div>

                  {/* Week Days */}
                  <div className="grid grid-cols-7 text-xs text-muted-foreground mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                      <div key={d} className="text-center">{d}</div>
                    ))}
                  </div>

                  {/* Days */}
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() + 1,
                      0
                    ).getDate() }).map((_, i) => {
                      const day = i + 1;
                      const dateStr = `${currentMonth.getFullYear()}-${String(
                        currentMonth.getMonth() + 1
                      ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

                      const isAvailable = availableDates.includes(dateStr);
                      const isSelected = selectedDate === dateStr;

                      return (
                        <button
                          key={dateStr}
                          disabled={!isAvailable}
                          onClick={() => isAvailable && setSelectedDate(dateStr)}
                          className={cn(
                            "h-10 rounded-lg text-sm",
                            isSelected
                              ? "bg-primary text-white"
                              : isAvailable
                              ? "border hover:border-primary"
                              : "text-muted-foreground cursor-not-allowed"
                          )}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* SLOTS */}
            <div>
              <div className="flex justify-between mb-3">
                <h2 className="font-semibold">Available Slots</h2>
                {selectedDate && (
                  <span className="text-sm text-muted-foreground">
                    {formatDate(selectedDate)}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {slots.map((slot) => {
                  const selected = selectedSlot?.id === slot.id;
                  const sold = slot.status === "sold_out" || slot.seats_left === 0;

                  return (
                    <button
                      key={slot.id}
                      disabled={sold}
                      onClick={() => {
                        setSelectedSlot(selected ? null : slot);
                        setQuantity(1);
                      }}
                      className={cn(
                        "w-full flex justify-between items-center p-5 rounded-2xl border transition",
                        selected && "border-[#ff7a1a] bg-[#fff3ea]",
                        !selected && !sold && "hover:border-[#ff7a1a]",
                        sold && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="flex gap-4 items-center">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          selected ? "bg-[#ff7a1a] text-white" : "bg-muted"
                        )}>
                          <Clock />
                        </div>
                        <div>
                          <p className="font-medium">
                            {formatTime12h(slot.start_time)} – {formatTime12h(slot.end_time)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {sold ? "Sold out" : `${slot.seats_left} left`}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-lg">₹{slot.price}</p>
                        {selected && (
                          <p className="text-xs text-[#ff7a1a]">SELECTED</p>
                        )}
                        {sold && (
                          <p className="text-xs text-destructive">SOLD OUT</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT – BOOKING SUMMARY */}
          <div className="sticky top-8">
            <div className="rounded-2xl overflow-hidden shadow border bg-card">
              <div className="bg-[#ff7a1a] text-white p-4 font-semibold">
                Booking Summary
              </div>

              {selectedSlot ? (
                <div className="p-6 space-y-5">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Event</span>
                      <span className="font-medium">{event?.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date</span>
                      <span>{formatDate(selectedSlot.event_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time</span>
                      <span>
                        {formatTime12h(selectedSlot.start_time)} –{" "}
                        {formatTime12h(selectedSlot.end_time)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price per seat</span>
                      <span>₹{selectedSlot.price}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span>Number of Seats</span>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                          <Minus />
                        </button>
                        <span className="font-bold">{quantity}</span>
                        <button onClick={() => setQuantity(q => Math.min(3, q + 1))}>
                          <Plus />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-right mt-1">
                      Max 3 per booking
                    </p>
                  </div>

                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="text-xl font-bold">
                      ₹{selectedSlot.price * quantity}
                    </span>
                  </div>

                  {bookingError && (
                  <div className="mt-3 bg-red-50 border border-red-300 text-red-700 text-sm p-3 rounded-lg">
                    {bookingError}
                  </div>
                  )}

                  <button
                    onClick={handleProceed}
                    className="w-full bg-[#ff7a1a] hover:bg-[#ff6a00] text-white py-3 rounded-xl font-semibold"
                  >
                    Proceed to Pay
                  </button>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  Select a date & slot to continue
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default EventBooking;
