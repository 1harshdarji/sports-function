import { useEffect, useState } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeroEvent {
  id: number;
  title: string;
  location: string;
  image_url: string;
  price?: number;
}

const EventsHero = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState<HeroEvent[]>([]);
  const [index, setIndex] = useState(0);

  /* ================= FETCH REAL EVENTS ================= */
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/events")
      .then((res) => {
        // show only first 8 events
        setEvents(res.data.data.slice(0, 8));
      })
      .catch(console.error);
  }, []);

  /* ================= AUTO SLIDE ================= */
  useEffect(() => {
    if (!events.length) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % events.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [events]);

  if (!events.length) return null;

  return (
    <section className="relative bg-white overflow-hidden">

      {/* LEFT ARROW */}
      <button
        onClick={() =>
          setIndex((index - 1 + events.length) % events.length)
        }
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg"
      >
        <ChevronLeft size={28} />
      </button>

      {/* RIGHT ARROW */}
      <button
        onClick={() =>
          setIndex((index + 1) % events.length)
        }
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg"
      >
        <ChevronRight size={28} />
      </button>

      {/* SLIDER WRAPPER */}
      <div className="w-full overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {events.map((event) => (
            <div
              key={event.id}
              className="min-w-full"
            >
              <div className="container mx-auto px-6 py-14">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">

                  {/* LEFT CONTENT */}
                  <div className="space-y-5">
                    <h1 className="text-4xl md:text-5xl font-bold">
                      {event.title}
                    </h1>

                    <p className="text-lg text-muted-foreground">
                      {event.location}
                    </p>

                    <p className="text-xl font-semibold">
                      ₹{event.price || 499} onwards
                    </p>

                    <button
                      onClick={() => navigate(`/events/${event.id}`)}
                      className="rounded-full bg-black px-8 py-3 text-white text-lg"
                    >
                      Book tickets
                    </button>
                  </div>

                  {/* RIGHT IMAGE */}
                  <div className="flex justify-center md:justify-end">
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full max-w-[620px] h-[320px] object-cover rounded-3xl shadow-xl"
                    />
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DOT INDICATORS */}
      <div className="flex justify-center gap-2 pb-6">
        {events.map((_, i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full transition ${
              i === index ? "bg-black" : "bg-gray-300"
            }`}
          />
        ))}
      </div>

    </section>
  );
};

export default EventsHero;
