import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import {
  MapPin,
  Star,
  Clock,
  Users,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const SPORTS = [
  {
    key: "football",
    name: "Football",
    image:
      "https://i0.wp.com/thetitansfa.com/wp-content/uploads/2024/01/206www.emmahurleyphotography.com_-1-scaled.jpg?fit=2560%2C1708&quality=60&ssl=1",
    courts: 4,
    available: true,
    featured: true,
  },
  {
    key: "cricket",
    name: "Cricket",
    image: "https://images.unsplash.com/photo-1593766788306-28561086694e",
    courts: 2,
    available: true,
    featured: false,
  },
  {
    key: "badminton",
    name: "Badminton",
    image:
      "https://images.unsplash.com/photo-1721760886982-3c643f05813d?q=80&w=2070&auto=format&fit=crop",
    courts: 6,
    available: true,
    featured: true,
  },
  {
    key: "swimming",
    name: "Swimming",
    image:
      "https://t4.ftcdn.net/jpg/03/09/96/91/240_F_309969130_8X2AuHtA0yUbKH1i5BH2PeHqUakLivfg.jpg",
    courts: 3,
    available: false,
    featured: false,
  },
  {
    key: "tennis",
    name: "Tennis",
    image:
      "https://media.istockphoto.com/id/1447342123/photo/young-adult-female-hitting-a-backhand-shot.jpg?s=612x612&w=0&k=20&c=g46FfX951ho-yNXWHKrSyMVNae8QPOnOH7zrn6HvuLE=",
    courts: 4,
    available: true,
    featured: false,
  },
  {
    key: "basketball",
    name: "Basketball",
    image:
      "https://images.unsplash.com/photo-1519861531473-9200262188bf",
    courts: 2,
    available: true,
    featured: true,
  },
  {
    key: "gym",
    name: "Gym",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48",
    courts: 1,
    available: true,
    featured: false,
  },
  {
    key: "yoga",
    name: "Yoga",
    image:
      "https://images.unsplash.com/photo-1545205597-3d9d02c29597",
    courts: 2,
    available: true,
    featured: false,
  },
  {
    key: "wrestling",
    name: "Wrestling",
    image:
      "https://images.unsplash.com/photo-1542468019-550cb643a5e3",
    courts: 1,
    available: true,
    featured: false,
  },
];

const Facilities = () => {
  const navigate = useNavigate();

  // Navigation logic taken from second code
  const handleSportClick = (sport: any) => {
    navigate(`/grounds/${sport.key}`);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white/90 text-sm px-4 py-2 rounded-full mb-6">
              <MapPin className="w-4 h-4" />
              <span>Main Campus • 123 Sports Avenue</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4">
              Book Your Perfect <br />
              <span className="text-white/90">Sports Facility</span>
            </h1>

            <p className="text-lg text-white/80 mb-8 max-w-xl">
              Reserve your spot at our world-class facilities. Indoor courts,
              outdoor fields, and more.
            </p>

            <div className="flex gap-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                  <Star className="text-white w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">4.9</p>
                  <p className="text-sm text-white/70">Rating</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                  <Users className="text-white w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">10k+</p>
                  <p className="text-sm text-white/70">Users</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                  <Clock className="text-white w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">24/7</p>
                  <p className="text-sm text-white/70">Access</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sports Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-10">
            <div className="flex items-center gap-2 text-primary text-sm font-semibold mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Explore Facilities</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Choose Your Sport
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {SPORTS.map((sport) => (
              <div
                key={sport.key}
                onClick={() => handleSportClick(sport)}
                className="relative h-80 group cursor-pointer rounded-3xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl"
              >
                <img
                  src={sport.image}
                  alt={sport.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {sport.featured && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="badge-featured flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Featured
                    </span>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-2xl font-bold text-white">
                      {sport.name}
                    </h3>
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                      <ChevronRight className="text-white w-5 h-5" />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <span
                      className={
                        sport.available
                          ? "badge-available"
                          : "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-400"
                      }
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          sport.available
                            ? "bg-green-500"
                            : "bg-red-400"
                        }`}
                      />
                      {sport.available ? "Available" : "Unavailable"}
                    </span>
                    <span className="text-white/70 text-sm">
                      {sport.courts} Courts
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Facilities;
