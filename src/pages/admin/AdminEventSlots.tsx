import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";


interface EventSlot {
  id: number;
  event_date: string;
  start_time: string;
  end_time: string;
  total_seats: number;
  booked_seats: number;
  seats_left: number;
  status: "open" | "sold_out" | "disabled";
}

const AdminEventSlots = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const token = localStorage.getItem("token");

  const [slots, setSlots] = useState<EventSlot[]>([]);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  const enableSlot = async (slotId: number) => {
    await axios.put(
      `http://localhost:5000/api/admin/event-slots/${slotId}/enable`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchSlots(); // refresh
  };

  const disableSlot = async (slotId: number) => {
    await axios.put(
      `http://localhost:5000/api/admin/event-slots/${slotId}/disable`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchSlots(); // refresh
  };

  

  const fetchSlots = async () => {
    if (!eventId) return; // || date

    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:5000/api/admin/events/${eventId}/slots`,
        {
          //params: { date },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSlots(res.data.data || []);
    } catch (err) {
      console.error("Slots fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [date]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Event Slots</h1>
        <p className="text-muted-foreground">
          View slots for selected event & date
        </p>
      </div>

      {/* DATE PICKER */}
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <input
            type="date"
            className="border rounded-md px-3 py-2 text-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* SLOT TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Slots</CardTitle>
        </CardHeader>

        <CardContent>
          {loading && (
            <p className="text-muted-foreground">Loading slots...</p>
          )}

          {!loading && slots.length === 0 && (
            <p className="text-muted-foreground">
              No slots found for selected date
            </p>
          )}

          {slots.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="py-2">Time</th>
                    <th>Seats</th>
                    <th>Booked</th>
                    <th>Left</th>
                    <th>Action</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {slots.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b hover:bg-muted/50"
                    >
                      <td className="py-2 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        {s.start_time} – {s.end_time}
                      </td>

                      <td>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {s.total_seats}
                        </div>
                      </td>

                      <td>{s.booked_seats}</td>
                      <td>{s.seats_left}</td>
                        <td className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/admin/events/${eventId}/bookings`)}
                          >
                            View Bookings
                          </Button>
                        </td>
                      <td>
                        <Badge
                          variant={
                            s.status === "sold_out"
                              ? "destructive"
                              : "default"
                          }
                        >
                          {s.status === "sold_out"
                            ? "SOLD OUT"
                            : "OPEN"}
                        </Badge>
                        
                      </td>
                      <td className="text-right space-x-2">
                        {s.status === "disabled" ? (
                          <Button
                            size="sm"
                            onClick={() => enableSlot(s.id)}
                          >
                            Enable
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => disableSlot(s.id)}
                          >
                            Disable
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminEventSlots;
