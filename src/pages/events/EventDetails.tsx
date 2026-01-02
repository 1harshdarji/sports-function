
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Layout } from "@/components/Layout";

interface EventInfo {
  id: number;
  title: string;
  description: string;
  category: string;
  image_url: string;
  location: string;
}


const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventInfo | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const eventRes = await axios.get(
          `http://localhost:5000/api/events/${eventId}`
        );

        setEvent(eventRes.data.data);

        // ✅ dates come from THIS response

      } catch (err) {
        console.error(err);
      }
    };

    loadData();
  }, [eventId]);



  if (!event) {
    return <Layout><div className="p-20">Loading...</div></Layout>;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">

        
        <div className="grid md:grid-cols-2 gap-10">
          
            <img
              src={
                event.image_url ||
                "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7"
              }
              alt={event.title}
              className="w-full h-[360px] object-cover rounded-xl shadow-lg"
            />
          

          <div className="space-y-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {event.category}
              </p>

              <h1 className="text-4xl font-bold leading-tight">
                {event.title}
              </h1>

              <p className="text-muted-foreground text-sm">
                {event.location}
            </p>

            <div className="pt-4">
              <button
                onClick={() => navigate(`/events/${event.id}/book`)}
                className="bg-black hover:bg-gray-900 text-white px-8 py-3 rounded-xl text-sm font-medium"
              >
                Book Tickets
              </button>
            </div>
          </div>
        </div>

        
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-2">About the Event</h2>
          <p className="text-muted-foreground">{event.description}</p>
        </div>
        <div className="mt-12 border-t pt-8">
          <h2 className="text-xl font-semibold mb-2">Venue</h2>
          <p className="text-muted-foreground">{event.location}</p>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              event.location
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3 text-sm text-primary"
          >
            📍 Get Directions
          </a>
        </div>

      </div>
    </Layout>
  );
};

export default EventDetails;
