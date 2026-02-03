import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BecomeCoach = () => {
  const navigate = useNavigate();
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    email: "",
    phone: "",
    country: "India",
    specialization: "",
    experience: "",
    location: "",
    bio: "",
    achievements: "",
    hourlyRate: "",
    certificate: null as File | null,
    profileImage: null as File | null,
  });

  const isEmailValid = form.email.endsWith("@gmail.com");
  const isPhoneValid = /^\d{10}$/.test(form.phone);

  const isFormValid =
    form.firstName &&
    form.lastName &&
    form.age &&
    form.gender &&
    form.email &&
    form.phone &&
    form.specialization &&
    form.experience &&
    form.location &&
    form.bio &&
    form.achievements &&
    form.hourlyRate &&
    form.certificate &&      
    form.profileImage &&     
    isEmailValid &&
    isPhoneValid;

  const handleChange = (e: any) => {
    const { name, value, files } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };
  //============ Already form submitted ==========
  useEffect(() => {
    const checkRequest = async () => {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/coach-requests/my",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.exists) {
        setAlreadySubmitted(true);
        alert("You have already submitted a coach request");
        navigate("/");
      }
    };

    checkRequest();
  }, []);

  // ================= HANDLE SUBMIT ======================
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const formData = new FormData();

  Object.entries(form).forEach(([key, value]) => {
    if (value !== null) {
      formData.append(key, value as any);
    }
  });

  try {
    const token = localStorage.getItem("token");

    await axios.post(
      "http://localhost:5000/api/coach-requests",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    alert("Coach request submitted successfully!");
    window.location.href = "/profile?tab=coach";
  } catch (err) {
    console.error(err);
    alert("Submission failed");
  }
};


  return (
    <Layout>
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto px-4 py-12"
      >

        <h1 className="text-3xl font-bold mb-2">Become a Coach</h1>
        <p className="text-muted-foreground mb-8">
          Fill all details carefully. Admin will verify your identity before approval.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input name="firstName" placeholder="First Name" onChange={handleChange} />
          <Input name="lastName" placeholder="Last Name" onChange={handleChange} />

          <Input
            name="age"
            type="number"
            placeholder="Age"
            min={18}
            onChange={handleChange}
          />

          <select
            name="gender"
            className="border rounded-md px-3 py-2"
            onChange={handleChange}
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
          />

          <Input
            name="phone"
            placeholder="Phone Number (10 digits)"
            onChange={handleChange}
          />

          <select
            name="country"
            className="border rounded-md px-3 py-2"
            onChange={handleChange}
          >
            <option>India</option>
            <option disabled>More countries coming soon</option>
          </select>

          <Input
            name="specialization"
            placeholder="Sport / Specialization"
            onChange={handleChange}
          />

          <Input
            name="experience"
            type="number"
            placeholder="Years of Experience"
            onChange={handleChange}
          />

          <Input
            name="hourlyRate"
            type="number"
            placeholder="Monthly Coaching Fee (₹)"
            onChange={handleChange}
          />

          <Input
            name="location"
            placeholder="Preferred Location"
            onChange={handleChange}
          />
        </div>

        <div className="mt-4 space-y-4">
          <Textarea
            name="bio"
            placeholder="Short professional bio"
            onChange={handleChange}
          />

          <Textarea
            name="achievements"
            placeholder="Achievements (mandatory)"
            onChange={handleChange}
          />

          <div>
            <label className="block mb-1 font-medium">
              Upload Certification (PDF only)
            </label>
            <input
              type="file"
              name="certificate"
              accept="application/pdf"
              onChange={handleChange}
              className="block w-full"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Upload Profile Image (JPG / PNG)
            </label>
            <input
              type="file"
              name="profileImage"
              accept="image/png, image/jpeg"
              onChange={handleChange}
              className="block w-full"
            />
          </div>

        </div>

        {/* Validation Messages */}
        <div className="mt-4 space-y-1 text-sm text-red-500">
          {!isEmailValid && form.email && <p>Email must end with @gmail.com</p>}
          {!isPhoneValid && form.phone && <p>Phone number must be 10 digits</p>}
        </div>

        <Button
          type="submit"
          disabled={!isFormValid || alreadySubmitted}
          className="w-full mt-6 disabled:opacity-50"
        >
          Submit Request
        </Button>
      </form>
    </Layout>
  );
};

export default BecomeCoach;
