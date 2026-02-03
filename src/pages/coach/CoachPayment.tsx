import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";

const CoachPayment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const pay = async () => {
      const token = localStorage.getItem("token");

      const { data } = await axios.post(
        "http://localhost:5000/api/coach-payments/create-order",
        { bookingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const options = {
        key: data.data.key,
        amount: data.data.amount,
        currency: "INR",
        order_id: data.data.orderId,
        handler: async (response: any) => {
          await axios.post(
            "http://localhost:5000/api/coach-payments/verify",
            response,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          navigate("/profile?tab=training");
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    };

    pay();
  }, [bookingId]);

  return null;
};

export default CoachPayment;
