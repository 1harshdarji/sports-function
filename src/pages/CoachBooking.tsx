import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";


const CoachBooking = () => {
  const { id } = useParams();

  /* ================= COACH ================= */
  const [coach, setCoach] = useState<any>(null);
  const [loadingCoach, setLoadingCoach] = useState(true);
  const bookingDate = new Date();
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [priceInfo, setPriceInfo] = useState<any>(null);


  /* ================= FORM ================= */
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    email: "",
    phone: "",
    address: "",
    medical: "",
    preferredTime: "",
  });

  const [submitted, setSubmitted] = useState(false);

  /* ================= FETCH COACH ================= */
  useEffect(() => {
    if (!id) return;

    axios
      .get(`http://localhost:5000/api/coaches/${id}`)
      .then(res => setCoach(res.data.data))
      .catch(console.error)
      .finally(() => setLoadingCoach(false));
  }, [id]);

  /* ================= HANDLERS ================= */
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  /* ================= VALIDATION ================= */
  const emailValid = form.email.endsWith("@gmail.com");
  const phoneValid = /^\d{10}$/.test(form.phone);

  const isFormValid =
    form.firstName &&
    form.lastName &&
    form.age &&
    form.gender &&
    emailValid &&
    phoneValid &&
    form.address &&
    form.preferredTime;

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!isFormValid) return;

  try {
    const token = localStorage.getItem("token");

    const res = await axios.post(
      "http://localhost:5000/api/coach-bookings",
      {
        coachId: id,

        // MUST MATCH DB COLUMNS
        participant_first_name: form.firstName,
        participant_last_name: form.lastName,

        // optional full snapshot (keep)
        user_form_snapshot: form,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );


    setSubmitted(true);

    setStartDate(res.data.data.startDate);
    setEndDate(res.data.data.endDate);
    setPriceInfo(res.data.data);

    localStorage.setItem("coachBookingId", res.data.data.bookingId);


  } catch (err) {
    console.error(err);
    alert("Failed to create booking");
  }
};


const handleProceedToPayment = async () => {
  try {
    const token = localStorage.getItem("token");
    const bookingId = localStorage.getItem("coachBookingId");

    const res = await axios.post(
      "http://localhost:5000/api/coach-payments/create-order",
      { bookingId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { orderId, amount, key } = res.data.data;

    const options = {
      key,
      amount,
      currency: "INR",
      name: "SportHub",
      description: "Coach Session Booking",
      order_id: orderId,
      handler: async (response: any) => {
        await axios.post(
          "http://localhost:5000/api/coach-payments/verify",
          response,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        alert("Payment Successful!");
      },
      theme: { color: "#f97316" },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();

  } catch (err) {
    console.error(err);
    alert("Failed to start Razorpay");
  }
};



  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Book Coach Session</h1>

        {/* ================= COACH CARD ================= */}
        {loadingCoach && <p>Loading coach details...</p>}
        {coach && (
        <div className="rounded-xl border p-5 mb-8 bg-card space-y-2">
            <h2 className="text-xl font-bold">{coach.name}</h2>

            <p className="text-orange-500 font-medium">
              {coach.specialization} Coach
            </p>

            <div className="text-sm text-muted-foreground space-y-1">
              <p><b>Age:</b> {coach.age}</p>
              <p><b>Email:</b> {coach.email}</p>
              <p><b>Phone:</b> {coach.phone}</p>
              <p><b>Location:</b> {coach.location}</p>
              <p><b>Experience:</b> {coach.experienceYears} years</p>
            </div>
          </div>
        )}

        {/* ================= USER FORM ================= */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="firstName"
              placeholder="First Name"
              onChange={handleChange}
              disabled={submitted}
            />
            <Input
              name="lastName"
              placeholder="Last Name"
              onChange={handleChange}
              disabled={submitted}
            />

            <Input
              name="age"
              type="number"
              placeholder="Age"
              min={10}
              onChange={handleChange}
              disabled={submitted}
            />

            <select
              name="gender"
              className="border rounded-md px-3 py-2"
              onChange={handleChange}
              disabled={submitted}
            >
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>

            <Input
              name="email"
              placeholder="Email (must be @gmail.com)"
              onChange={handleChange}
              disabled={submitted}
            />

            <Input
              name="phone"
              placeholder="Phone Number (10 digits)"
              onChange={handleChange}
              disabled={submitted}
            />
          </div>

          <Input
            name="address"
            placeholder="Address"
            onChange={handleChange}
            disabled={submitted}
          />

          <select
            name="preferredTime"
            className="border rounded-md px-3 py-2 w-full"
            onChange={handleChange}
            disabled={submitted}
          >
            <option value="">Preferred Time Slot</option>
            <option>Morning</option>
            <option>Afternoon</option>
            <option>Evening</option>
          </select>

          <Textarea
            name="medical"
            placeholder="Medical conditions (optional)"
            onChange={handleChange}
            disabled={submitted}
          />

          {/* VALIDATION MESSAGES */}
          <div className="text-sm text-red-500 space-y-1">
            {!emailValid && form.email && <p>Email must end with @gmail.com</p>}
            {!phoneValid && form.phone && <p>Phone must be 10 digits</p>}
          </div>

          {/* SUBMIT */}
          <Button
            type="submit"
            disabled={!isFormValid || submitted}
            className="w-full"
          >
            Submit Booking Details
          </Button>
        </form>

        {/* ================= PAYMENT ================= */}
        {priceInfo && (
        <div className="mt-6 rounded-xl bg-muted p-4 space-y-1 text-sm">
            <p><b>Start Date:</b> {new Date(startDate!).toLocaleDateString()}</p>
            <p><b>End Date:</b> {new Date(endDate!).toLocaleDateString()}</p>

            <p><b>Base Price:</b> ₹{priceInfo.basePrice}</p>

            {priceInfo.discountPercent > 0 && (
              <p className="text-green-600 font-semibold">
                Elite Discount: −{priceInfo.discountPercent}%
              </p>
            )}

            <p className="font-bold text-base">
              Payable Amount: ₹{priceInfo.finalAmount}
            </p>
          </div>
        )}


        <Button
          disabled={!submitted}
          onClick={handleProceedToPayment}
          className="w-full mt-4 bg-orange-500 disabled:opacity-50"
        >
          Proceed to Payment
        </Button>

      </div>
    </Layout>
  );
};

export default CoachBooking;
