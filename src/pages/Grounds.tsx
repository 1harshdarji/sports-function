import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronLeft } from "lucide-react";

/**
 * Grounds Page
 * Shows all grounds for ONE selected sport
 */

const Grounds = () => {
  const { sportKey } = useParams();
  const navigate = useNavigate();

  const [grounds, setGrounds] = useState<any[]>([]);

  // Fetch facilities from backend
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/facilities")
      .then((res) => {
        const all = res.data.data || [];
        const filtered = all.filter(
          (f: any) => f.sportKey === sportKey
        );
        setGrounds(filtered);
      })
      .catch(console.error);
  }, [sportKey]);

  return (
    <div className="min-h-screen bg-background">
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-6xl">

          {/* Back Button */}
          <button
            onClick={() => navigate("/facilities")}
            className="group flex items-center gap-2 text-sm mb-8 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Sports
          </button>

          {/* Page Title */}
          <h1 className="text-4xl font-bold mb-12 capitalize tracking-tight">
            {sportKey}{" "}
            <span className="text-muted-foreground font-normal">
              Grounds
            </span>
          </h1>

          {/* Grounds Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
            {grounds.map((ground) => (
              <div
                key={ground.id}
                onClick={() => navigate(`/booking/${ground.id}`)}
                className="
                  group
                  relative
                  h-80
                  rounded-2xl
                  overflow-hidden
                  cursor-pointer
                  border
                  border-border/50
                  hover:border-primary/50
                  transition-all
                  duration-500
                "
              >
                {/* Image */}
                <img
                  src={
                    ground.imageUrl ||
                    "https://images.unsplash.com/photo-1521412644187-c49fa049e84d"
                  }
                  alt={ground.name}
                  className="
                    h-full
                    w-full
                    object-cover
                    transition-transform
                    duration-700
                    group-hover:scale-105
                  "
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {/* Always Visible Title */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                  <h3 className="text-2xl font-semibold text-white tracking-tight transition-transform duration-500 group-hover:-translate-y-20">
                    {ground.name}
                  </h3>
                </div>

                {/* Hover Details */}
                <div
                  className="
                    absolute
                    bottom-0
                    left-0
                    right-0
                    p-6
                    translate-y-full
                    group-hover:translate-y-0
                    transition-transform
                    duration-500
                    ease-out
                    z-10
                  "
                >
                  {/* Price */}
                  <p className="text-lg font-medium text-white/90 mb-3">
                    ₹{ground.pricePerHour}
                    <span className="text-sm text-white/60"> / hour</span>
                  </p>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-2">
                    {ground.amenities?.slice(0, 3).map((a: string, i: number) => (
                      <span
                        key={i}
                        className="
                          text-xs
                          bg-white/15
                          backdrop-blur
                          px-3
                          py-1.5
                          rounded-full
                          text-white/90
                          border
                          border-white/10
                        "
                      >
                        {a}
                      </span>
                    ))}
                    {ground.amenities?.length > 3 && (
                      <span className="text-xs bg-white/15 px-3 py-1.5 rounded-full text-white/90">
                        +{ground.amenities.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Corner Accent */}
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>

          {/* Empty State */}
          {grounds.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                No grounds available for this sport.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Grounds;
