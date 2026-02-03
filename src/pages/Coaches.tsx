import { Star, ChevronDown, Shield, Award, Lock, Calendar, Clock, CheckCircle } from "lucide-react";
import coachesHero from "@/assets/coaches-hero.jpg";
import { Layout } from "@/components/Layout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import axios from "axios";

const sports = ["Football", "Cricket", "Gym", "Swimming", "Yoga", "Tennis"];
const locations = ["Downtown", "Uptown", "Midtown", "Suburbs"];
const availability = ["Today", "This Week", "Weekends", "Flexible"];
const levels = ["Beginner", "Intermediate", "Advanced", "All Levels"];

const trustItems = [
  {
    icon: Shield,
    title: "Verified Coaches",
    description: "All coaches undergo thorough background checks and verification",
  },
  {
    icon: Award,
    title: "Certified Professionals",
    description: "Only certified and experienced coaches on our platform",
  },
  {
    icon: Lock,
    title: "Secure Booking",
    description: "Safe and encrypted payment processing for all sessions",
  },
  {
    icon: Calendar,
    title: "Flexible Scheduling",
    description: "Book sessions that fit your schedule, anytime",
  },
];

const StarRating = ({ rating }: { rating: number }) => {
  return (

    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= Math.floor(rating)
              ? "fill-orange-500 text-orange-500"
              : star - 0.5 <= rating
              ? "fill-orange-500/50 text-orange-500"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
      <span className="ml-1 text-sm font-medium text-foreground">{rating}</span>
    </div>
  );
};

const FilterDropdown = ({ label, options }: { label: string; options: string[] }) => (
  <div className="relative">
    <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all hover:border-orange-500/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500/20">
      {label}
      <ChevronDown className="h-4 w-4 text-muted-foreground" />
    </button>
    <div className="absolute left-0 top-full z-50 mt-2 hidden w-48 rounded-lg border border-border bg-card p-1 shadow-card group-focus-within:block">
      {options.map((option) => (
        <div
          key={option}
          className="cursor-pointer rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
        >
          {option}
        </div>
      ))}
    </div>
  </div>
);
type Coach = {
  id: number;
  name: string;
  specialization: string;
  experienceYears: number;
  hourlyRate?: number;
  profile_image?: string;
};

const CoachCard = ({
  coach,
  navigate,
}: {
  coach: Coach;
  navigate: (path: string) => void;
}) => {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div
      className="group cursor-pointer rounded-xl overflow-hidden bg-card card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1"
    >
      {/* IMAGE */}
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <img
          src={
            coach.profile_image
              ? coach.profile_image // `http://localhost:5000${coach.profile_image}`
              : "https://via.placeholder.com/400x500"
          }
          alt={coach.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Sport badge */}
        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-card/90 backdrop-blur-sm text-xs font-medium text-foreground">
          {coach.specialization}
        </span>

        {/* Like */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center"
        >
          <Heart
            className={`w-4 h-4 ${
              isLiked ? "fill-accent text-accent" : "text-foreground"
            }`}
          />
        </button>

        {/* Price */}
        {coach.hourlyRate !== undefined && (
          <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-card/95 backdrop-blur-sm">
            <span className="text-sm font-bold text-foreground">
              ₹{coach.hourlyRate}
            </span>
            <span className="text-xs text-muted-foreground ml-1">/Monthly</span>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-lg text-foreground">
          {coach.name}
        </h3>

        <p className="text-sm text-orange-500 font-medium">
          {coach.specialization}
        </p>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => navigate(`/coaches/${coach.id}`)}
            className="flex-1 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium"
          >
            View Profile
          </button>

          <button
            onClick={() => navigate(`/coaches/${coach.id}/book`)}
            className="flex-1 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Book Session
          </button>
        </div>
      </div>
    </div>
  );
};


const CoachesPage = () => {
  const navigate = useNavigate();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  axios
    .get("http://localhost:5000/api/coaches")
    .then(res => {
      const mapped = res.data.data.map((c: any) => ({
        id: c.id,
        name: c.name,                 
        specialization: c.specialization,
        experienceYears: c.experience_years,
        hourlyRate: Number(c.hourlyRate),
        profile_image: c.profile_image
          ? `http://localhost:5000${c.profile_image}`
          : null,
      }));

      setCoaches(mapped);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
}, []);



  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden">
          <img
            src={coachesHero}
            alt="Sports coaching"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/80 via-foreground/70 to-foreground/80" />
          <div className="relative z-10 px-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-primary-foreground md:text-5xl lg:text-6xl">
              Train with certified coaches
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80 md:text-xl">
              Book expert coaches for any sport, any level. Elevate your game with personalized training.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button className="rounded-lg bg-orange-500 px-8 py-3 font-semibold text-white transition-all hover:bg-orange-600 hover:shadow-lg">
                Find a Coach
              </button>
              <button 
                onClick={() => navigate("/become-coach")}
                className="rounded-lg border-2 border-primary-foreground/30 bg-primary-foreground/10 px-8 py-3 font-semibold text-primary-foreground backdrop-blur transition-all hover:bg-primary-foreground/20">
                Become a Coach
              </button>
            </div>
          </div>
        </section>

        {/* Sticky Filter Bar */}
        <section className="sticky top-0 z-40 border-b border-border bg-background/95 py-4 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl bg-card p-4 shadow-filter lg:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <FilterDropdown label="Sport" options={sports} />
                <FilterDropdown label="Location" options={locations} />
                <FilterDropdown label="Availability" options={availability} />
                <FilterDropdown label="Level" options={levels} />
              </div>
              <button className="rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-orange-600">
                Search Coaches
              </button>
            </div>
          </div>
        </section>

        {/* Coach Listing Grid */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground md:text-3xl">Available Coaches</h2>
                <p className="mt-1 text-muted-foreground">
                  {coaches.length} coaches ready to train you
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <button className="flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground">
                  Highest Rated
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {loading && <p>Loading coaches...</p>}
              {!loading && coaches.length === 0 && (
                <p className="text-muted-foreground">No coaches available yet</p>
              )}

              {coaches.map((coach) => (
                <CoachCard key={coach.id} coach={coach} navigate={navigate} />
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <button className="rounded-lg border border-border bg-card px-8 py-3 font-medium text-foreground transition-all hover:bg-muted hover:shadow-md">
                Load More Coaches
              </button>
            </div>
          </div>
        </section>
        {/* Trust & Quality Section */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">
                Why Choose SportHub Coaches?
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
                We ensure quality and safety in every training session
              </p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {trustItems.map((item, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-border bg-card p-6 text-center shadow-card transition-all hover:shadow-card-hover"
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-orange-500/10">
                    <item.icon className="h-7 w-7 text-orange-500" />
                  </div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-orange-500 py-16">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Ready to start training?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/80">
              Join thousands of athletes who have improved their skills with our certified coaches.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button className="rounded-lg bg-white px-8 py-3 font-semibold text-orange-500 transition-all hover:bg-white/90 hover:shadow-lg">
                Browse All Coaches
              </button>
              <button className="rounded-lg border-2 border-white/30 px-8 py-3 font-semibold text-white transition-all hover:bg-white/10">
                Learn More
              </button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default CoachesPage;