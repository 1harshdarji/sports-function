import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import { 
  MapPin
} from "lucide-react";

const SPORTS = [
  {
    key: "football",
    name: "Football",
    image: "https://images.unsplash.com/photo-1509027572446-af8401acfdc3"
  },
  {
    key: "cricket",
    name: "Cricket",
    image: "https://images.unsplash.com/photo-1593766788306-28561086694e"
  },
  {
    key: "badminton",
    name: "Badminton",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e"
  },
  {
    key: "swimming",
    name: "Swimming",
    image: "https://images.unsplash.com/photo-1502904550040-7534597429ae"
  },
  {
    key: "tennis",
    name: "Tennis",
    image: "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf"
  },
  {
    key: "basketball",
    name: "Basketball",
    image: "https://images.unsplash.com/photo-1519861531473-9200262188bf"
  },
  {
    key: "gym",
    name: "Gym",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48"
  },
  {
    key: "yoga",
    name: "Yoga",
    image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597"
  },
  {
    key: "wrestling",
    name: "Wrestling",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b"
  }
];

// USE STATES
const Facilities = () => {

const navigate = useNavigate();

const handleSportClick = (sport: any) => {
  navigate(`/grounds/${sport.key}`);
};


  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-12 md:py-16 gradient-hero">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-secondary text-sm mb-4">
            <MapPin className="w-4 h-4" />
            <span>Main Campus - 123 Sports Avenue</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
            Book a Facility
          </h1>
          <p className="text-primary-foreground/80">
            Reserve your spot at our world-class facilities
          </p>
        </div>
        <section className="py-10 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {SPORTS.map((sport) => (
                <div
                  key={sport.key}
                  onClick={() => handleSportClick(sport)}
                  className="
                    relative
                    h-72                     /* CARD HEIGHT – increase for bigger cards */
                    rounded-2xl
                    overflow-hidden
                    cursor-pointer
                    shadow-lg               /* BASE SHADOW */
                    hover:shadow-2xl        /* STRONGER SHADOW ON HOVER */
                    transition-all
                    duration-300
                    group                   /* REQUIRED for hover effects */
                  "
                >
                  {/* IMAGE – fills entire card */}
                  <img
                    src={sport.image}
                    alt={sport.name}
                    className="
                      h-full
                      w-full
                      object-cover          /* IMAGE COVERS FULL CARD */
                      transition-transform
                      duration-300
                      group-hover:scale-105 /* SLIGHT ZOOM ON HOVER */
                    "
                  />

                  {/* DARK OVERLAY – hidden by default */}
                  <div
                    className="
                      absolute inset-0
                      bg-black/50            /* DARK TRANSPARENT OVERLAY */
                      opacity-0              /* HIDDEN INITIALLY */
                      group-hover:opacity-100
                      transition-opacity
                      duration-300
                      flex items-center justify-center
                    "
                  >
                    {/* SPORT NAME – shows only on hover */}
                    <h3 className="text-white text-2xl font-semibold tracking-wide">
                      {sport.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>
    </Layout>
  );
};

export default Facilities;
