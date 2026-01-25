import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Layout } from "@/components/Layout";
import { ChevronLeft, MapPin, Calendar, Clock, ClipboardList } from "lucide-react";
import { formatBookingDate } from "@/lib/date"; // ✅ ADD THIS

const toYMD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const Booking = () => {
  const [activeImage, setActiveImage] = useState(0);

  const { facilityId } = useParams();
  const navigate = useNavigate();
  const [facility, setFacility] = useState<any>(null);
  /*===============Image Slider=======================*/
  const images = facility?.imageUrl
  ? [1, 2, 3, 4].map(
      (n) => `http://localhost:5000${facility.imageUrl}/${n}.jpg`
    )
  : [];

  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);

  const [calendarStartDate, setCalendarStartDate] = useState(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0); // 🔥 IMPORTANT
    return d;
  });

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  /* ---------------- calendar navigation ---------------- */
  const goPrevWeek = () => {
    const d = new Date(calendarStartDate);
    d.setDate(d.getDate() - 7);
    setCalendarStartDate(d);
    setSelectedDate(new Date(d)); // ✅ ADD THIS LINE
  };

  const goNextWeek = () => {
    const d = new Date(calendarStartDate);
    d.setDate(d.getDate() + 7);
    setCalendarStartDate(d);
    setSelectedDate(new Date(d));// ✅ ADD THIS LINE
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

    axios
      .get(`http://localhost:5000/api/facilities/${facilityId}/slots`, {
        params: { date: toYMD(selectedDate) },
      })
      .then((res) => {
        const rawSlots = res.data.data.slots || [];

        const normalizedSlots = rawSlots.map((slot: any) => ({
          ...slot,
          isAvailable:
            slot.isAvailable === 1 ||
            slot.isAvailable === true ||
            slot.isAvailable === "1",
        }));

        setSlots(normalizedSlots);
      })
      .catch(console.error);
  }, [facilityId, selectedDate]);
  /* ================= RESET SLOT ON DATE CHANGE ================= */
  useEffect(() => {
    // 🔥 VERY IMPORTANT
    // When date changes, previously selected slot
    // must NOT be reused (prevents next-week greying bug)
    setSelectedSlot(null);
  }, [selectedDate]);


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
  if (!selectedSlot || !facility) return;

  const token = localStorage.getItem("token");

  // 🔒 If not logged in → save pending booking
  if (!token) {
    localStorage.setItem(
      "pendingBooking",
      JSON.stringify({
        facilityId,
        slotId: selectedSlot.id,
        date: toYMD(selectedDate),
      })
    );
    navigate("/login");
    return;
  }

  try {
    /* ================= 1️⃣ CREATE RAZORPAY ORDER ================= */
    const orderRes = await axios.post(
        "http://localhost:5000/api/payments/razorpay/order",
        {
          bookingId: selectedSlot.id,          // ONLY for receipt reference
          amount: facility.pricePerHour,       // facility price
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { orderId, amount, currency, key } = orderRes.data.data;

      /* ================= 2️⃣ OPEN RAZORPAY ================= */
      const options = {
        key,
        amount,
        currency,
        name: "SportHub",
        description: `${facility.name} Booking`,
        order_id: orderId,

        handler: async function (response: any) {
          try {
            /* ================= 3️⃣ VERIFY PAYMENT ================= */
            await axios.post(
              "http://localhost:5000/api/payments/razorpay/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,

                // 🔑 FACILITY BOOKING DATA (NOT EVENT)
                bookingData: {
                  facilityId,
                  slotId: selectedSlot.id,
                  date: toYMD(selectedDate),
                  startTime: selectedSlot.startTime,
                  endTime: selectedSlot.endTime,
                  amount: facility.pricePerHour,
                },
              },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            localStorage.removeItem("pendingBooking");

            alert("✅ Payment successful! Booking pending admin approval.");
            navigate("/profile?tab=bookings");
          } catch (err) {
            console.error(err);
            alert("Payment done, but booking verification failed");
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
  useEffect(() => {
  if (!images.length) return;

  const interval = setInterval(() => {
    setActiveImage((prev) => (prev + 1) % images.length);
  }, 3000); // change image every 3 seconds

  return () => clearInterval(interval);
}, [images]);


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
            {/* LEFT COLUMN */}
            <div className="space-y-4">
              {/* IMAGE */}
              <div className="h-[420px] rounded-2xl overflow-hidden bg-black">
                {facility && (
                  <img
                    src={images[activeImage]}
                    alt={facility.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* FACILITY INFO CARD (BELOW IMAGE) */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mt-4 space-y-3">

                  {/* SPORT TYPE */}
                  <p className="text-xs font-semibold uppercase text-orange-500">
                    {facility?.sportKey}
                  </p>

                  {/* GROUND NAME */}
                  <h2 className="text-xl font-bold text-gray-900">
                    {facility?.name}
                  </h2>

                  {/* LOCATION */}
                  <p className="text-sm text-gray-500">
                    {facility?.location}
                  </p>

                  {/* PRICE */}
                  <div className="pt-3 border-t flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{facility?.pricePerHour}
                    </span>
                    <span className="text-sm text-gray-500">/hour</span>
                  </div>
                </div>
              </div>

            {/* BOOKING CARD */}
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
              {/* TITLE */}
              <div className="-mx-6 -mt-6 mb-6 bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 rounded-t-2xl">
                <h2 className="text-xl font-bold text-white">
                  <Calendar className="w-5 h-5 text-white" />
                  Book Your Session
                </h2>
                <p className="text-sm text-orange-100">
                  Select your preferred date and time
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
                      key={toYMD(date)}
                      onClick={() => {
                        const d = new Date(date);
                        d.setHours(12, 0, 0, 0); // 🔥 FINAL FIX
                        setSelectedDate(d);
                      }}
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
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="w-4 h-4 text-orange-500" />
                  Available Time Slots
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {slots.map((slot) => {
                      //const isDisabled = !slot.isAvailable;
                      const isDisabled = !slot.isAvailable || slot.isBooked;
                      const isSelected = selectedSlot?.id === slot.id;

                      return (
                        <button
                          //key={slot.id}
                          key={`${toYMD(selectedDate)}-${slot.startTime}-${slot.endTime}`}
                          disabled={isDisabled}
                          onClick={() => !isDisabled && setSelectedSlot(slot)}
                          className={`
                            py-2 rounded-lg text-sm transition
                            ${isDisabled
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : isSelected
                              ? "bg-orange-500 text-white"
                              : "bg-gray-100 hover:bg-gray-200"}
                          `}
                        >
                          {formatTo12Hour(slot.startTime)} –{" "}
                          {formatTo12Hour(slot.endTime)}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* SUMMARY */}
              <div className="bg-[#fff7ed] rounded-2xl p-5 border border-[#fde68a] space-y-4">
                <h3 className="flex items-center gap-2 font-semibold text-sm text-[#9a3412]">
                  <ClipboardList className="w-4 h-4 text-orange-500" />
                  Booking Summary
                </h3>

                {/* Facility */}
                <div className="text-sm space-y-2">
                  <div className="flex justify-between border-b border-[#fde68a] pb-2">
                    <span className="text-[#9a3412]/70">Facility</span>
                    <span className="font-medium capitalize text-[#9a3412]">
                      {facility?.sportKey}
                    </span>
                  </div>

                  {/* Ground */}
                  <div className="flex justify-between border-b border-[#fde68a] pb-2">
                    <span className="text-[#9a3412]/70">Ground</span>
                    <span className="text-right text-[#9a3412]">
                      {facility?.name}
                      {facility?.location
                        ? `, ${facility.location}`
                        : ""}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="flex justify-between border-b border-[#fde68a] pb-2">
                    <span className="text-[#9a3412]/70">Date</span>
                    <span className="text-[#9a3412]">
                      {`${selectedDate.getDate()} ${selectedDate.toLocaleDateString("en-IN", {
                        weekday: "long",
                      })}, ${selectedDate.toLocaleDateString("en-IN", {
                        month: "short",
                      })}`}
                    </span>
                  </div>

                  {/* Time */}
                  <div className="flex justify-between border-b border-[#fde68a] pb-2">
                    <span className="text-[#9a3412]/70">Time</span>
                    <span className="text-[#9a3412]">
                      {selectedSlot
                        ? `${formatTo12Hour(
                            selectedSlot.startTime
                          )} – ${formatTo12Hour(selectedSlot.endTime)}`
                        : "—"}
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="flex justify-between pt-2">
                    <span className="font-semibold text-[#9a3412]">
                      Total Amount
                    </span>
                    <span className="text-xl font-bold text-[#9a3412]">
                      ₹{facility?.pricePerHour}
                    </span>
                  </div>
                </div>

                <button
                  disabled={!selectedSlot}
                  onClick={handleConfirmBooking}
                  className={`
                    w-full mt-4 py-3 rounded-xl font-semibold transition
                    ${
                      selectedSlot
                        ? "bg-orange-500 text-white hover:bg-orange-600"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }
                  `}
                >
                  {selectedSlot ? "Confirm Booking" : "Select a time slot"}
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
