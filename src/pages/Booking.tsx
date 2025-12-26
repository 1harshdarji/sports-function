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

  // ---------- helpers ----------
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

  // ---------- data ----------
  useEffect(() => {
    if (!facilityId) return;
    axios
      .get(`http://localhost:5000/api/facilities/${facilityId}`)
      .then((res) => setFacility(res.data.data))
      .catch(console.error);
  }, [facilityId]);

  useEffect(() => {
    if (!facilityId || !selectedDate) return;
    axios
      .get(`http://localhost:5000/api/facilities/${facilityId}/slots`, {
        params: { date: selectedDate.toISOString().split("T")[0] },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setSlots(res.data.data.slots || []))
      .catch(console.error);
  }, [facilityId, selectedDate]);

  // ---------- UI ----------
  return (
    <Layout>
      <section className="py-10 bg-background">
        <div className="container mx-auto px-4">
          {/* BACK */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm mb-6 text-muted-foreground hover:text-primary"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* LEFT IMAGE */}
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

            {/* RIGHT PANEL */}
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
              {/* HEADER */}
              <div>
                <h2 className="text-2xl font-bold capitalize">
                  {facility?.sportKey || ""}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {facility?.name}
                  {facility?.location ? ` • ${facility.location}` : ""}
                </p>
              </div>

              {/* DATE */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">
                    Select Date
                    <span className="ml-2 text-muted-foreground font-normal">
                      ({formatMonthYear(selectedDate)})
                    </span>
                  </h3>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setCalendarStartDate((prev) => {
                          const d = new Date(prev);
                          d.setDate(prev.getDate() - 7);
                          return d;
                        })
                      }
                      className="p-2 rounded-md hover:bg-gray-100"
                    >
                      ‹
                    </button>

                    <button
                      onClick={() =>
                        setCalendarStartDate((prev) => {
                          const d = new Date(prev);
                          d.setDate(prev.getDate() + 7);
                          return d;
                        })
                      }
                      className="p-2 rounded-md hover:bg-gray-100"
                    >
                      ›
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {get7Days(calendarStartDate).map((date) => {
                    const isSelected =
                      date.toDateString() === selectedDate.toDateString();

                    return (
                      <button
                        key={date.toISOString()}
                        onClick={() => setSelectedDate(date)}
                        className={`rounded-xl py-3 text-center transition ${
                          isSelected
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        <div className="text-xs opacity-80">
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
              </div>

              {/* TIME */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Time</label>

                <div className="grid grid-cols-4 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 rounded-lg text-sm ${
                        selectedSlot?.id === slot.id
                          ? "bg-orange-500 text-white"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {formatTo12Hour(slot.startTime)} –{" "}
                      {formatTo12Hour(slot.endTime)}
                    </button>
                  ))}
                </div>

                {slots.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No slots available
                  </p>
                )}
              </div>

              {/* SUMMARY */}
              <div className="bg-gray-100 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-sm">Booking Summary</h3>

                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Facility</span>
                    <span>{facility?.name || "—"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span>
                      {selectedDate.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span>
                      {selectedSlot
                        ? `${formatTo12Hour(
                            selectedSlot.startTime
                          )} – ${formatTo12Hour(
                            selectedSlot.endTime
                          )}`
                        : "—"}
                    </span>
                  </div>
                </div>

                <button
                  disabled={!selectedSlot}
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
