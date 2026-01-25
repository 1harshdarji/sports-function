import { useParams, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const planConfig = {
  starter: { name: "Starter", price: 499 },
  pro: { name: "Pro", price: 1499 },
  elite: { name: "Elite", price: 2999 },
};
const planIdMap: Record<string, number> = {
  starter: 1,
  pro: 2,
  elite: 3,
};

/*===========================Razor Pay==========================*/
const loadRazorpay = () => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const MembershipCheckout = () => {
  const startMembershipPayment = async () => {
    const res = await fetch(
      "http://localhost:5000/api/membership-payments/order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ planId: selectedPlanId }),
      }
    );

    const result = await res.json();
    if (!result.success) return alert("Order failed");

    openRazorpay(result.data);
   };

  const openRazorpay = async (data: any) => { 
    const loaded = await loadRazorpay();
    if (!loaded) {
      alert("Razorpay SDK failed to load");
      return;
    }

    const options = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: "Sports Hub",
      description: data.planName,
      order_id: data.orderId,

      handler: async function (response: any) {
        await verifyPayment(response, data.paymentRecordId);
      },

      theme: {
        color: "#f97316",
      },
  };

  const rzp = new (window as any).Razorpay(options);
  rzp.open();
   };

  const verifyPayment = async (
    response: any,
    paymentRecordId: number
  ) => {
    const res = await fetch(
        "http://localhost:5000/api/membership-payments/verify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            paymentRecordId,
          }),
        }
      );

      const result = await res.json();

      if (result.success) {
        window.location.href = "/profile?tab=billing";
      } else {
        alert("Payment verification failed");
      }
   };


  const { plan } = useParams();
  const selectedPlanId = planIdMap[plan as keyof typeof planIdMap];
    if (!selectedPlanId) {
    alert("Invalid plan selected");
    return;
  }
  const navigate = useNavigate();

  const planData = planConfig[plan as keyof typeof planConfig];

  if (!planData) {
    navigate("/memberships");
    return null;
  }

  /* ---------------- form state ---------------- */
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    mobile: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ---------------- date logic ---------------- */
  const startDate = new Date();

  const endDate = useMemo(() => {
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + 1);
    return d;
  }, []);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  /* ---------------- validation ---------------- */
  const isValid =
    form.firstName &&
    form.lastName &&
    Number(form.age) >= 12 &&
    form.gender &&
    /^[6-9]\d{9}$/.test(form.mobile) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  /* ---------------- submit ---------------- */
  const handleProceed = () => {
    if (!isValid) return;

    alert("✅ Form valid. Next step: Razorpay (Section 3)");
  };

  return (
    <Layout>
      <section className="py-20 bg-[#f8fafc]">
        <div className="container max-w-3xl px-4">

          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#0f172a]">
              {planData.name} Membership
            </h1>
            <p className="text-[#6b7280]">
              Complete your details to continue
            </p>
          </div>

          {/* CARD */}
          <div className="bg-white rounded-2xl border border-[#e5e7eb] p-8 space-y-6">

            {/* USER INFO */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input name="firstName" onChange={handleChange} />
              </div>

              <div>
                <Label>Last Name</Label>
                <Input name="lastName" onChange={handleChange} />
              </div>

              <div>
                <Label>Age</Label>
                <Input name="age" type="number" min={12} onChange={handleChange} />
              </div>

              <div>
                <Label>Gender</Label>
                <select
                  name="gender"
                  onChange={handleChange}
                  className="w-full h-10 rounded-md border border-input px-3"
                >
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <Label>Mobile Number</Label>
                <Input
                  name="mobile"
                  placeholder="10 digit number"
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Email (Gmail)</Label>
                <Input
                  name="email"
                  type="email"
                  placeholder="example@gmail.com"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* DATES */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input value={formatDate(startDate)} disabled />
              </div>

              <div>
                <Label>End Date</Label>
                <Input value={formatDate(endDate)} disabled />
              </div>
            </div>

            {/* SUMMARY */}
            <div className="rounded-xl bg-[#fff7ed] border border-[#fde68a] p-5">
              <div className="flex justify-between text-sm">
                <span className="text-[#9a3412]">Plan</span>
                <span className="font-semibold">{planData.name}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-[#9a3412]">Price</span>
                <span className="font-bold text-lg">₹{planData.price}</span>
              </div>
            </div>

            {/* CTA */}
            <Button
              disabled={!isValid}
              onClick={startMembershipPayment}
              className={`w-full h-12 text-lg font-semibold rounded-xl ${
                isValid
                  ? "bg-[#f97316] hover:bg-[#ea580c] text-white"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              Proceed to Pay
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default MembershipCheckout;
