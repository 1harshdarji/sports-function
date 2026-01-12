import { Star, ChevronDown, Shield, Award, Lock, Calendar, X, MapPin, Clock, CheckCircle } from "lucide-react";
import coachesHero from "@/assets/coaches-hero.jpg";
import { Layout } from "@/components/Layout";


const sports = ["Football", "Cricket", "Gym", "Swimming", "Yoga", "Tennis"];
const locations = ["Downtown", "Uptown", "Midtown", "Suburbs"];
const availability = ["Today", "This Week", "Weekends", "Flexible"];
const levels = ["Beginner", "Intermediate", "Advanced", "All Levels"];

const coaches = [
  {
    name: "Marcus Johnson",
    sport: "Football",
    experience: 12,
    rating: 4.9,
    reviews: 156,
    bio: "Former professional player with UEFA coaching license. Specialized in youth development and tactical training.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    tags: ["Certified", "Advanced"],
    price: "$75/hr",
  },
  {
    name: "Sarah Chen",
    sport: "Yoga",
    experience: 8,
    rating: 5.0,
    reviews: 203,
    bio: "RYT-500 certified yoga instructor. Expert in Vinyasa, Hatha, and therapeutic yoga practices.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    tags: ["Beginner Friendly", "Certified"],
    price: "$60/hr",
  },
  {
    name: "David Martinez",
    sport: "Swimming",
    experience: 15,
    rating: 4.8,
    reviews: 89,
    bio: "Olympic trials qualifier and certified lifeguard. Teaches all strokes from beginner to competitive level.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    tags: ["Advanced", "Certified"],
    price: "$85/hr",
  },
  {
    name: "Emma Williams",
    sport: "Tennis",
    experience: 10,
    rating: 4.9,
    reviews: 134,
    bio: "WTA ranked player turned coach. Specializes in serve technique and match strategy.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    tags: ["Beginner Friendly", "Advanced"],
    price: "$70/hr",
  },
  {
    name: "James Thompson",
    sport: "Gym",
    experience: 7,
    rating: 4.7,
    reviews: 178,
    bio: "NASM certified personal trainer. Expert in strength training, HIIT, and body transformation programs.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    tags: ["Beginner Friendly", "Certified"],
    price: "$55/hr",
  },
  {
    name: "Priya Sharma",
    sport: "Cricket",
    experience: 11,
    rating: 4.8,
    reviews: 92,
    bio: "Former national team player. Specializes in batting technique, bowling, and fielding drills.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face",
    tags: ["Advanced", "Certified"],
    price: "$65/hr",
  },
];

const featuredCoach = {
  name: "Marcus Johnson",
  sport: "Football",
  experience: 12,
  rating: 4.9,
  reviews: 156,
  bio: "Former professional player with UEFA coaching license. Marcus has trained over 500 athletes across various skill levels, from youth academies to semi-professional teams. His methodology combines technical skill development with mental conditioning and tactical awareness.",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
  certifications: ["UEFA A License", "Sports Psychology Certificate", "First Aid Certified"],
  sportsHandled: ["Football", "Futsal", "Fitness Training"],
  availableDays: ["Mon", "Tue", "Wed", "Thu", "Sat"],
  price: "$75/hr",
};

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

const CoachCard = ({ coach }: { coach: typeof coaches[0] }) => (
  <div className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-4">
        <img
          src={coach.avatar}
          alt={coach.name}
          className="h-24 w-24 rounded-full object-cover ring-4 ring-muted"
        />
        <div className="absolute -bottom-1 -right-1 rounded-full bg-success p-1">
          <CheckCircle className="h-4 w-4 text-success-foreground" />
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-foreground">{coach.name}</h3>
      <p className="text-sm font-medium text-orange-500">{coach.sport}</p>
      
      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>{coach.experience} years experience</span>
      </div>
      
      <div className="mt-2">
        <StarRating rating={coach.rating} />
        <span className="text-xs text-muted-foreground">({coach.reviews} reviews)</span>
      </div>
      
      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
        {coach.bio}
      </p>
      
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {coach.tags.map((tag) => (
          <span
            key={tag}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              tag === "Certified"
                ? "bg-success/10 text-success"
                : tag === "Advanced"
                ? "bg-orange-500/10 text-orange-500"
                : "bg-accent text-accent-foreground"
            }`}
          >
            {tag}
          </span>
        ))}
      </div>
      
      <p className="mt-4 text-lg font-bold text-foreground">{coach.price}</p>
      
      <div className="mt-4 flex w-full gap-3">
        <button className="flex-1 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted hover:border-foreground/20">
          View Profile
        </button>
        <button className="flex-1 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-orange-600 hover:shadow-lg">
          Book Session
        </button>
      </div>
    </div>
  </div>
);

const CoachProfilePreview = ({ coach }: { coach: typeof featuredCoach }) => (
  <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-card-hover">
    <div className="absolute right-4 top-4">
      <button className="rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
        <X className="h-5 w-5" />
      </button>
    </div>
    
    <div className="p-8">
      <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start">
        <div className="flex-shrink-0">
          <img
            src={coach.avatar}
            alt={coach.name}
            className="h-40 w-40 rounded-2xl object-cover shadow-lg"
          />
        </div>
        
        <div className="flex-1 text-center lg:text-left">
          <div className="flex flex-col items-center gap-2 lg:flex-row lg:items-center">
            <h2 className="text-2xl font-bold text-foreground">{coach.name}</h2>
            <span className="rounded-full bg-success/10 px-3 py-1 text-sm font-medium text-success">
              Verified Coach
            </span>
          </div>
          
          <p className="mt-1 text-lg font-medium text-orange-500">{coach.sport} Specialist</p>
          
          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground lg:justify-start">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{coach.experience} years exp.</span>
            </div>
            <StarRating rating={coach.rating} />
            <span>({coach.reviews} reviews)</span>
          </div>
          
          <p className="mt-4 text-muted-foreground">{coach.bio}</p>
          
          <div className="mt-6">
            <h4 className="font-semibold text-foreground">Certifications</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {coach.certifications.map((cert) => (
                <span
                  key={cert}
                  className="flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-sm text-accent-foreground"
                >
                  <Award className="h-3 w-3" />
                  {cert}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="font-semibold text-foreground">Sports Coached</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {coach.sportsHandled.map((sport) => (
                <span
                  key={sport}
                  className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground"
                >
                  {sport}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="font-semibold text-foreground">Available Days</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <span
                  key={day}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    coach.availableDays.includes(day)
                      ? "bg-orange-500 text-white"
                      : "bg-muted text-muted-foreground/50"
                  }`}
                >
                  {day}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mt-6 flex items-center justify-between rounded-xl bg-muted/50 p-4">
            <div>
              <p className="text-sm text-muted-foreground">Session Price</p>
              <p className="text-2xl font-bold text-foreground">{coach.price}</p>
            </div>
            <div className="flex gap-3">
              <button className="rounded-lg border border-border bg-card px-6 py-3 font-medium text-foreground transition-all hover:bg-muted">
                Contact Coach
              </button>
              <button className="rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition-all hover:bg-orange-600 hover:shadow-lg">
                Book Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CoachesPage = () => {
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
              <button className="rounded-lg border-2 border-primary-foreground/30 bg-primary-foreground/10 px-8 py-3 font-semibold text-primary-foreground backdrop-blur transition-all hover:bg-primary-foreground/20">
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
              {coaches.map((coach, index) => (
                <CoachCard key={index} coach={coach} />
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <button className="rounded-lg border border-border bg-card px-8 py-3 font-medium text-foreground transition-all hover:bg-muted hover:shadow-md">
                Load More Coaches
              </button>
            </div>
          </div>
        </section>

        {/* Coach Profile Preview */}
        <section className="bg-muted/30 py-16">
          <div className="mx-auto max-w-5xl px-4">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">Featured Coach</h2>
              <p className="mt-1 text-muted-foreground">
                Get to know our top-rated professional
              </p>
            </div>
            <CoachProfilePreview coach={featuredCoach} />
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