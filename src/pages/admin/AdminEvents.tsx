import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AdminEvent {
  id: number;
  title: string;
  category: string;
  location: string;
  status: string;
  start_date: string;
  end_date: string;
  total_slots: number;
  total_booked: number;
}

const AdminEvents = () => {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  /* ================= FETCH EVENTS ================= */
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/admin/events",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setEvents(res.data.data || []);
      } catch (err) {
        console.error("Admin events fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  /* ================= STATUS ================= */
  const getEventStatus = (start: string, end: string) => {
    const today = new Date().toISOString().slice(0, 10);
    if (today < start) return "Upcoming";
    if (today > end) return "Completed";
    return "Ongoing";
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Events Management</h1>
          <p className="text-muted-foreground">
            View and monitor all platform events
          </p>
        </div>
        <Button onClick={() => navigate("/admin/events/create")}>
          + Create Event
        </Button>
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-muted-foreground">Loading events...</p>
      )}

      {/* EMPTY */}
      {!loading && events.length === 0 && (
        <p className="text-muted-foreground">No events found</p>
      )}

      {/* EVENTS TABLE */}
      {!loading && events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Events</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="py-3">Event</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Duration</th>
                    <th>Slots</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {events.map((e) => {
                    const status = getEventStatus(
                      e.start_date,
                      e.end_date
                    );

                    return (
                      <tr
                        key={e.id}
                        className="border-b hover:bg-muted/40"
                      >
                        <td className="py-3 font-medium">
                          {e.title}
                        </td>

                        <td>
                          <Badge variant="outline">
                            {e.category}
                          </Badge>
                        </td>

                        <td className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          {e.location}
                        </td>

                        <td>
                          <div className="flex items-center gap-1 text-xs">
                            <Calendar className="w-4 h-4" />
                            {e.start_date.slice(0, 10)} → {e.end_date.slice(0, 10)}
                          </div>
                        </td>

                        <td>
                          <div className="text-xs">
                            <b>{e.total_booked}</b> booked /{" "}
                            {e.total_slots} slots
                          </div>
                        </td>

                        <td>
                          <Badge
                            variant={
                              status === "Upcoming"
                                ? "secondary"
                                : status === "Ongoing"
                                ? "default"
                                : "outline"
                            }
                          >
                            {status}
                          </Badge>
                        </td>
                        <td className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/admin/events/${e.id}/slots`)}
                          >
                            Manage Slots
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminEvents;
