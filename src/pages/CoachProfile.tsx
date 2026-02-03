import { useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";


const CoachProfile = () => {
  const { id } = useParams();
  const [coach, setCoach] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
   
useEffect(() => {
  if (!id) return;

  axios
    .get(`http://localhost:5000/api/coaches/${id}`)
    .then(res => setCoach(res.data.data))
    .catch(console.error)
    .finally(() => setLoading(false));
}, [id]);

useEffect(() => {
  if (!id) return;

  axios
    .get(`http://localhost:5000/api/coach-reviews/${id}`)
    .then(res => {
      setReviews(res.data.data || []);
    })
    .catch(err => {
      console.error("Failed to fetch reviews", err);
      setReviews([]);
    });
}, [id]);

return (
  <Layout>
    <div className="container mx-auto px-4 py-10">
      {loading && <p>Loading coach profile...</p>}

      {!loading && !coach && (
        <p className="text-muted-foreground">Coach not found</p>
      )}

      {coach && (
        <div className="grid md:grid-cols-[320px,1fr] gap-8">

          {/* LEFT SIDE */}
          <div className="space-y-4">
            <div className="bg-card border rounded-2xl p-6 flex flex-col items-center">
              <img
                src={
                  coach.profile_image
                    ? `http://localhost:5000${coach.profile_image}`
                    : "https://via.placeholder.com/300"
                }
                className="w-64 h-80 rounded-xl object-cover"
              />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">{coach.name}</h2>
              <p className="text-orange-500 font-medium">
                {coach.specialization}
              </p>
              <p className="text-sm text-muted-foreground">
                ⭐ {coach.rating || "No rating"} ({coach.total_reviews || 0} reviews)
              </p>
              <button
                onClick={() => window.location.href = `/coaches/${coach.id}/book`}
                className="mt-3 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-xl font-semibold"
              >
                Book Session
              </button>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-6">

            {/* BASIC DETAILS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="font-medium">{coach.age}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-medium">{coach.gender}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{coach.email}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{coach.phone}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{coach.location}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Experience</p>
                <p className="font-medium">
                  {coach.experienceYears} years
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Monthy Fee</p>
                <p className="font-medium">
                  ₹{coach.hourlyRate}
                </p>
              </div>
            </div>

            {/* BIO */}
            <div>
              <h3 className="font-semibold text-lg">About Coach</h3>
              <p className="text-muted-foreground mt-2">
                {coach.bio}
              </p>
            </div>

            {/* ACHIEVEMENTS */}
            <div>
              <h3 className="font-semibold text-lg">Achievements</h3>
              <p className="text-muted-foreground mt-2">
                {coach.achievements || "Not provided"}
              </p>
            </div>

            {/* RATINGS & REVIEWS */}
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Ratings & Reviews
              </h3>

              {reviews.length === 0 && (
                <p className="text-muted-foreground">
                  No reviews yet for this coach.
                </p>
              )}

              {reviews.map((r, i) => (
                <div key={i} className="border rounded-lg p-4 mt-3">
                  <p className="font-semibold">
                    {r.participant_first_name} {r.participant_last_name}
                  </p>
                  <p>⭐ {r.rating}/5</p>
                  {r.review && (
                    <p className="text-muted-foreground mt-1">
                      {r.review}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  </Layout>
);

};

export default CoachProfile;
