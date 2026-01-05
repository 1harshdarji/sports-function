import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import {
  MapPin,
  Calendar,
  ArrowRight,
  Share2,
  Heart,
  Clock,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        const res = await axios.get(
          `http://localhost:5000/api/events/${eventId}`
        );

        setEvent(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [eventId]);

  /* ===================== LOADING UI ===================== */
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 lg:py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
              <div className="lg:col-span-3">
                <Skeleton className="w-full aspect-[4/3] rounded-2xl" />
              </div>
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-14 w-full" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  /* ===================== NOT FOUND ===================== */
  if (!event) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Event not found</h1>
            <p className="text-muted-foreground mt-2">
              The event you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate("/")} className="mt-6">
              Go Home
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  /* ===================== MAIN UI ===================== */
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
            {/* IMAGE */}
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="relative group">
                <div className="relative overflow-hidden rounded-2xl shadow-elevated">
                  <img
                    src={
                      event.image_url ||
                      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7"
                    }
                    alt={event.title}
                    className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>

                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-3 rounded-full ${
                      isLiked ? "bg-red-500 text-white" : "bg-white"
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isLiked ? "fill-current" : ""
                      }`}
                    />
                  </button>

                  <button className="p-3 rounded-full bg-white">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* DETAILS */}
            <motion.div
              className="lg:col-span-2 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="space-y-6">
                <Badge variant="secondary">{event.category}</Badge>

                <h1 className="text-3xl lg:text-4xl font-bold">
                  {event.title}
                </h1>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
                    <MapPin className="w-5 h-5" />
                    <p>{event.location}</p>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
                    <Calendar className="w-5 h-5" />
                    <p>Coming Soon</p>
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={() =>
                    navigate(`/events/${event.id}/book`)
                  }
                  className="h-14"
                >
                  Book Tickets
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                <div className="flex gap-6 text-sm text-muted-foreground">
                  <div className="flex gap-2 items-center">
                    <Users className="w-4 h-4" />
                    2.4k interested
                  </div>
                  <div className="flex gap-2 items-center">
                    <Clock className="w-4 h-4" />
                    Selling fast
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* DESCRIPTION */}
          <div className="mt-16 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">
              About the Event
            </h2>
            <p className="text-muted-foreground">
              {event.description}
            </p>
          </div>

          {/* VENUE */}
          <div className="mt-12 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Venue</h2>
              <p className="font-medium text-lg">{event.location}</p>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    event.location
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 text-sm text-accent hover:underline"
                >
                  Get Directions
                  <ArrowRight className="w-4 h-4" />
                </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EventDetails;
