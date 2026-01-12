import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Calendar, Clock } from "lucide-react";

interface EventBooking {
  id: number;
  username: string;
  event_date: string;
  start_time: string;
  end_time: string;
  quantity: number;
  total_amount: number;
  status: string;
}

const AdminEventBookings = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<EventBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!eventId) return;

    const fetchBookings = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/admin/events/${eventId}/bookings`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setBookings(res.data.data || []);
      } catch (err) {
        console.error("Failed to load event bookings", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [eventId]);

  return (
    <div className="p-6 space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div>
          <h1 className="text-2xl font-bold">Event Bookings</h1>
          <p className="text-muted-foreground">
            View all bookings for this event
          </p>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Booked Users
          </CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <p className="text-muted-foreground">
              No bookings found for this event.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="py-3">User</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Seats</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.map((b) => (
                    <tr
                      key={b.id}
                      className="border-b hover:bg-muted/40"
                    >
                      <td className="py-3 font-medium">{b.username}</td>

                      <td>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {b.event_date}
                        </div>
                      </td>

                      <td>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          {b.start_time} – {b.end_time}
                        </div>
                      </td>

                      <td>{b.quantity}</td>

                      <td className="font-medium">
                        ₹{b.total_amount}
                      </td>

                      <td>
                        <Badge
                          variant={
                            b.status === "confirmed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {b.status}
                        </Badge>
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

export default AdminEventBookings;
