import { useEffect, useState } from "react";
import axios from "axios";
import { Layout } from "@/components/Layout";
import { MapPin, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EventItem {
  id: number;
  title: string;
  category: string;
  image_url: string;
  location: string;
  price: number;
  max_participants: number;
  current_participants: number;
  event_date: string;
  start_time?: string;
}

const formatFirstDate = (date?: string, time?: string) => {
  if (!date || !time) return "Date TBA";

  const d = new Date(`${date}T${time}`);
  if (isNaN(d.getTime())) return "Date TBA";

  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }) + ", " +
  d.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
};



const EventsList = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/events")
      .then((res) => setEvents(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          Loading events...
        </div>
      </Layout>
    );
  }

  return (
    
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-6">Explore Events</h1>

        {events.length === 0 && (
          <p className="text-muted-foreground">No events available</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map((event) => {
            
            return (
              <div
                key={event.id}
                onClick={() => navigate(`/events/${event.id}`)}
                className="cursor-pointer rounded-xl overflow-hidden border bg-white hover:shadow-xl transition"
              >
                {/* IMAGE */}
                <div className="relative aspect-[3/4] w-full bg-gray-100 overflow-hidden">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>

                {/* CONTENT */}
                <div className="p-4 space-y-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {event.category}
                  </p>

                  <h3 className="font-semibold text-lg leading-snug">
                    {event.title}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatFirstDate(event.event_date, event.start_time)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-3">
                    <span className="font-semibold">
                      ₹{event.price} onwards
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    
  );
};

export default EventsList;
