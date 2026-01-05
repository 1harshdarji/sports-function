import { useEffect, useState } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

/* ================= TYPES ================= */
interface HeroEvent {
  id: number;
  title: string;
  location: string;
  image_url: string;
  price?: number;
  category?: string;
}

/* ================= COMPONENT ================= */
const EventsHero = () => {
  const navigate = useNavigate();

  /* ---------- STATE ---------- */
  const [events, setEvents] = useState<HeroEvent[]>([]);
  const [index, setIndex] = useState(0);

  /* ================= FETCH EVENTS FROM BACKEND ================= */
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/events")
      .then((res) => {
        // limit hero slider to first 8 events
        setEvents(res.data.data.slice(0, 8));
      })
      .catch(console.error);
  }, []);

  /* ================= AUTO SLIDER (5s) ================= */
  useEffect(() => {
    if (!events.length) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % events.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [events]);

  if (!events.length) return null;

  const currentEvent = events[index];

  return (
    <section className="relative overflow-hidden hero-gradient">

      {/* ================= BACKGROUND IMAGE + OVERLAY ================= */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: `url(${currentEvent.image_url})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/40" />
      </div>

      {/* ================= LEFT ARROW ================= */}
      <button
        onClick={() =>
          setIndex((index - 1 + events.length) % events.length)
        }
        className="absolute left-4 md:left-8 top-1/2 z-20 -translate-y-1/2 rounded-full bg-card/90 p-2.5 shadow-lg backdrop-blur-sm transition-all hover:bg-card hover:scale-105"
      >
        <ChevronLeft className="h-5 w-5 text-foreground" />
      </button>

      {/* ================= RIGHT ARROW ================= */}
      <button
        onClick={() =>
          setIndex((index + 1) % events.length)
        }
        className="absolute right-4 md:right-8 top-1/2 z-20 -translate-y-1/2 rounded-full bg-card/90 p-2.5 shadow-lg backdrop-blur-sm transition-all hover:bg-card hover:scale-105"
      >
        <ChevronRight className="h-5 w-5 text-foreground" />
      </button>

      {/* ================= CONTENT ================= */}
      <div className="relative z-10 container mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center min-h-[400px]">

          {/* ---------- LEFT TEXT ---------- */}
          <div className="space-y-6 animate-slide-in" key={currentEvent.id}>
            {currentEvent.category && (
              <span className="inline-block px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium">
                {currentEvent.category}
              </span>
            )}

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight">
              {currentEvent.title}
            </h1>

            <p className="text-lg text-primary-foreground/80">
              📍 {currentEvent.location}
            </p>

            <p className="text-2xl font-bold text-primary-foreground">
              ₹{currentEvent.price || 499}{" "}
              <span className="text-base font-normal text-primary-foreground/70">
                onwards
              </span>
            </p>

            <Button
              size="lg"
              onClick={() => navigate(`/events/${currentEvent.id}`)}
              className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-8 py-6 text-lg font-semibold shadow-lg transition-all hover:scale-105"
            >
              Book Tickets
            </Button>
          </div>

          {/* ---------- RIGHT IMAGE ---------- */}
          <div className="hidden lg:flex justify-end">
            <div className="relative">
              <img
                src={currentEvent.image_url}
                alt={currentEvent.title}
                className="w-full max-w-[560px] h-[340px] object-cover rounded-2xl shadow-2xl transition-all duration-500"
              />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-xl bg-accent/20 backdrop-blur-sm" />
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-accent/30 backdrop-blur-sm" />
            </div>
          </div>

        </div>
      </div>

      {/* ================= DOT INDICATORS ================= */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {events.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index
                ? "w-8 bg-accent"
                : "w-2 bg-primary-foreground/40 hover:bg-primary-foreground/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default EventsHero;
