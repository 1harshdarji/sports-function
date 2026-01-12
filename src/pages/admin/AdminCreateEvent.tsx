import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarPlus } from "lucide-react";

const AdminCreateEvent = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    image_url: "",
    price: "",
    start_date: "",
    end_date: "",
    total_seats: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await axios.post(
      "http://localhost:5000/api/admin/events",
      {
        title: form.title,
        description: form.description,
        category: form.category,
        location: form.location,
        image_url: form.image_url,

        // ✅ THIS IS THE IMPORTANT PART
        event_date: form.start_date, // ← required by DB

        price: Number(form.price),
        is_free: Number(form.price) === 0 ? 1 : 0,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );


      navigate("/admin/events");
    } catch (err: any) {
      alert(
        err?.response?.data?.message || "Failed to create event"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarPlus className="w-5 h-5" />
            Create New Event
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* BASIC INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Event Title</Label>
              <Input name="title" value={form.title} onChange={handleChange} />
            </div>

            <div>
              <Label>Category</Label>
              <Input name="category" value={form.category} onChange={handleChange} />
            </div>

            <div>
              <Label>Location</Label>
              <Input name="location" value={form.location} onChange={handleChange} />
            </div>

            <div>
              <Label>Image URL</Label>
              <Input
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          {/* DATE RANGE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Event Date</Label>
              <Input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* SLOT CONFIG */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Price per Seat (₹)</Label>
              <Input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Total Seats per Slot</Label>
              <Input
                type="number"
                name="total_seats"
                value={form.total_seats}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => navigate("/admin/events")}>
              Cancel
            </Button>

            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCreateEvent;
