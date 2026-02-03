{/*import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const BookCoachSession = () => {
  const { id } = useParams(); // coachId
  const navigate = useNavigate();

  const [coach, setCoach] = useState<any>(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/coaches/${id}`)
      .then(res => setCoach(res.data.data));
  }, [id]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.post(
      "http://localhost:5000/api/coach-bookings",
      { coachId: id },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    navigate(`/coach-payment/${res.data.data.bookingId}`);
  };

  if (!coach) return null;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-6">Book Coach Session</h1>

        
        <div className="border rounded-xl p-4 mb-6 bg-muted">
          <p className="font-semibold">{coach.name}</p>
          <p className="text-sm text-muted-foreground">
            {coach.specialization} • {coach.experienceYears} yrs
          </p>
        </div>

        
        <div className="space-y-4">
          <Input name="fullName" placeholder="Full Name" onChange={handleChange} />
          <Input name="email" placeholder="Email" onChange={handleChange} />
          <Input name="phone" placeholder="Phone" onChange={handleChange} />
        </div>

        <Button className="w-full mt-6" onClick={handleSubmit}>
          Proceed to Payment
        </Button>
      </div>
    </Layout>
  );
};

export default BookCoachSession;*/}
