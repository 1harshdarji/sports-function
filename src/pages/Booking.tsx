import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Layout } from "@/components/Layout";
import { ChevronLeft } from "lucide-react";

const Booking = () => {
  const { facilityId } = useParams();
  const navigate = useNavigate();

  const [facility, setFacility] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);

  const [calendarStartDate, setCalendarStartDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  /* ---------------- calendar navigation ---------------- */
  const goPrevWeek = () => {
    const d = new Date(calendarStartDate);
    d.setDate(d.getDate() - 7);
    setCalendarStartDate(d);
    setSelectedDate(d); // ✅ ADD THIS LINE
  };

  const goNextWeek = () => {
    const d = new Date(calendarStartDate);
    d.setDate(d.getDate() + 7);
    setCalendarStartDate(d);
    setSelectedDate(d); // ✅ ADD THIS LINE
  };


  /* ---------------- helpers ---------------- */
  const get7Days = (start: Date) =>
    Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });

  const formatTo12Hour = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h = hour % 12 || 12;
    return `${h}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };

  const formatMonthYear = (date: Date) =>
    date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

  /* ================= FACILITY FETCH ================= */
  useEffect(() => {
    if (!facilityId) return;

    axios
      .get(`http://localhost:5000/api/facilities/${facilityId}`)
      .then((res) => setFacility(res.data.data))
      .catch(console.error);
  }, [facilityId]);

  /* ================= SLOTS FETCH + NORMALIZATION ================= */
  useEffect(() => {
    if (!facilityId || !selectedDate) return;

    const date =
      selectedDate.getFullYear() +
      "-" +
      String(selectedDate.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(selectedDate.getDate()).padStart(2, "0");

    axios
      .get(`http://localhost:5000/api/facilities/${facilityId}/slots`, {
        params: { date },
      })
      .then((res) => {
        const rawSlots = res.data.data.slots || [];

        const normalizedSlots = rawSlots.map((slot: any) => ({
          ...slot,
          isAvailable:
            slot.isAvailable === 1 ||
            slot.isAvailable === true ||
            slot.available === 1 ||
            slot.booked === 0 ||
            slot.isBooked === false,
        }));

        setSlots(normalizedSlots);
      })
      .catch(console.error);
  }, [facilityId, selectedDate]);

  /* ================= RESTORE PENDING BOOKING ================= */
  useEffect(() => {
    const pending = localStorage.getItem("pendingBooking");
    if (!pending) return;

    const data = JSON.parse(pending);

    if (data.facilityId === facilityId) {
      const [y, m, d] = data.date.split("-").map(Number);
      setSelectedDate(new Date(y, m - 1, d));

      setTimeout(() => {
        const match = slots.find((s) => s.id === data.slotId);
        if (match) setSelectedSlot(match);
      }, 300);
    }
  }, [facilityId, slots]);

  /* ================= CONFIRM BOOKING ================= */
  const handleConfirmBooking = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      localStorage.setItem(
        "pendingBooking",
        JSON.stringify({
          facilityId,
          date: selectedDate.toISOString(),
          slotId: selectedSlot.id,
        })
      );
      navigate("/login");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/payments/razorpay/order",
        {
          bookingId: selectedSlot.id,
          amount: facility.pricePerHour,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { orderId, amount, currency, key } = res.data.data;

      const options = {
        key,
        amount,
        currency,
        name: "SportHub",
        description: `${facility.name} Booking`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            await axios.post(
              "http://localhost:5000/api/payments/razorpay/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingData: {
                  facilityId,
                  slotId: selectedSlot.id,
                  date:
                    selectedDate.getFullYear() +
                    "-" +
                    String(selectedDate.getMonth() + 1).padStart(2, "0") +
                    "-" +
                    String(selectedDate.getDate()).padStart(2, "0"),
                  startTime: selectedSlot.startTime,
                  endTime: selectedSlot.endTime,
                  amount: facility.pricePerHour,
                  status: "pending",
                },
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            localStorage.removeItem("pendingBooking");
            alert("Payment successful! Booking pending admin approval.");
            navigate("/");
          } catch (err) {
            console.error(err);
            alert("Payment succeeded but booking verification failed");
          }
        },
        theme: { color: "#f97316" },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error(err);
      alert("Failed to start payment");
    }
  };

  /* ================= UI ================= */
  return (
    <Layout>
      <section className="py-10 bg-background">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm mb-6 text-muted-foreground hover:text-primary"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* IMAGE */}
            <div className="h-[420px] rounded-2xl overflow-hidden bg-black">
              {facility && (
                <img
                  src={
                    facility.imageUrl ||
                    "https://images.unsplash.com/photo-1521412644187-c49fa049e84d"
                  }
                  alt={facility.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* BOOKING CARD */}
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
              {/* TITLE */}
              <div>
                <h2 className="text-2xl font-bold capitalize">
                  {facility?.sportKey}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {facility?.name}
                  {facility?.location ? ` • ${facility.location}` : ""}
                </p>
              </div>

              {/* DATE HEADER */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={goPrevWeek}
                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                >
                  ←
                </button>

                <h3 className="text-sm font-medium text-center">
                  Select Date
                  <span className="ml-2 text-muted-foreground font-normal">
                    ({formatMonthYear(calendarStartDate)})
                  </span>
                </h3>

                <button
                  onClick={goNextWeek}
                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                >
                  →
                </button>
              </div>

              {/* DATE GRID */}
              <div className="grid grid-cols-7 gap-2">
                {get7Days(calendarStartDate).map((date) => {
                  const isSelected =
                    date.toDateString() === selectedDate.toDateString();

                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className={`rounded-xl py-3 ${
                        isSelected
                          ? "bg-orange-500 text-white"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      <div className="text-xs">
                        {date.toLocaleDateString("en-US", {
                          weekday: "short",
                        })}
                      </div>
                      <div className="text-lg font-semibold">
                        {date.getDate()}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* TIME SLOTS */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Time</label>
                <div className="grid grid-cols-4 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.id}
                      disabled={!slot.isAvailable}
                      onClick={() =>
                        slot.isAvailable && setSelectedSlot(slot)
                      }
                      className={`py-2 rounded-lg text-sm transition ${
                        !slot.isAvailable
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : selectedSlot?.id === slot.id
                          ? "bg-orange-500 text-white"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {formatTo12Hour(slot.startTime)} –{" "}
                      {formatTo12Hour(slot.endTime)}
                    </button>
                  ))}
                </div>
              </div>

              {/* SUMMARY */}
              <div className="bg-gray-100 rounded-xl p-4 space-y-4">
                <h3 className="font-semibold text-sm">Booking Summary</h3>

                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Facility</span>
                    <span className="font-medium capitalize">
                      {facility?.sportKey}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Ground</span>
                    <span>
                      {facility?.name}
                      {facility?.location
                        ? `, ${facility.location}`
                        : ""}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Date</span>
                    <span>
                      {selectedDate.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Time</span>
                    <span>
                      {selectedSlot
                        ? `${formatTo12Hour(
                            selectedSlot.startTime
                          )} – ${formatTo12Hour(selectedSlot.endTime)}`
                        : "—"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Price</span>
                    <span className="font-semibold">
                      ₹{facility?.pricePerHour}
                    </span>
                  </div>
                </div>

                <button
                  disabled={!selectedSlot}
                  onClick={handleConfirmBooking}
                  className="w-full mt-4 bg-orange-500 text-white py-2 rounded-lg disabled:opacity-50"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Booking;
