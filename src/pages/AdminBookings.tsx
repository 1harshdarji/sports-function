import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const formatDateOnly = (dateString: string) => {
  const [year, month, day] = dateString.split("T")[0].split("-");
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
const AdminBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const token = localStorage.getItem("token");

  const fetchBookings = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/bookings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBookings(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const approveBooking = async (id: number) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/bookings/${id}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchBookings(); // refresh UI
    } catch (err) {
      console.error(err);
    }
  };

  const rejectBooking = async (id: number) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/bookings/${id}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchBookings(); // refresh UI
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Pending Bookings</h1>

      {bookings.length === 0 && (
        <p className="text-muted-foreground">No pending bookings</p>
      )}

      {bookings.map((b) => (
        <Card key={b.id} className="p-4 space-y-2">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p>
                <b>Username:</b> {b.username}
              </p>
              <p>
                <b>Ground:</b> {b.facility_name}
              </p>
              <p>
                <b>Date:</b>{" "}
                {formatDateOnly(b.booking_date)}
              </p>
              <p>
                <b>Time:</b> {b.start_time} – {b.end_time}
              </p>
              <p>
                <b>Requested at:</b>{" "}
                {new Date(b.created_at).toLocaleString()}
              </p>
            </div>

            <Badge variant="secondary">PENDING</Badge>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => approveBooking(b.id)}
            >
              Approve
            </Button>

            <Button
              variant="destructive"
              onClick={() => rejectBooking(b.id)}
            >
              Reject
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AdminBookings;
