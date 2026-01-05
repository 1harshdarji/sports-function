import { useEffect, useState } from "react";
import axios from "axios";
import EventCard from "./EventCard";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


/* ================= TYPES ================= */
interface EventItem {
  id: number;
  title: string;
  category: string;
  image_url: string;
  location: string;
  price: number;
  event_date: string;
  start_time?: string;
}

/* ================= FILTERS (UI SAME) ================= */
const filters = [
  "All",
  "Music",
  "Comedy",
  "Festival",
  "Food & Drinks",
  "Theatre",
];

/* ================= COMPONENT ================= */
const EventsList = () => {
  /* ---------- STATE ---------- */
  const [events, setEvents] = useState<EventItem[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  /* ================= FETCH EVENTS (LOGIC FROM 2nd CODE) ================= */
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/events")
      .then((res) => {
        setEvents(res.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /* ================= FILTER + SEARCH (UI SAME) ================= */
  const filteredEvents = events.filter((event) => {
    const matchesFilter =
      activeFilter === "All" || event.category === activeFilter;

    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  /* ================= LOADING STATE ================= */
  if (loading) {
    return (
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto px-4 text-center">
          Loading events...
        </div>
      </section>
    );
  }

  /* ================= UI (100% SAME AS FIRST CODE) ================= */
  return (
    <section className="py-12 bg-secondary/30">
      <div className="container mx-auto px-4">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Upcoming Events
          </h2>

          {/* ---------- SEARCH ---------- */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>
            <Button variant="outline" size="icon" className="shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* ================= FILTER PILLS ================= */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeFilter === filter
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground hover:bg-muted"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* ================= EVENTS GRID ================= */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No events found
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                {...event}
              />
            ))}
          </div>
        )}

        {/* ================= LOAD MORE (UI ONLY) ================= */}
        {filteredEvents.length > 0 && (
          <div className="text-center mt-10">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-8"
            >
              Load More Events
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default EventsList;
