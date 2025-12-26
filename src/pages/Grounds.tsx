import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";

/**
 * Grounds Page
 * Shows all grounds for ONE selected sport
 */

const Grounds = () => {
  // gets sport key from URL (gym, tennis, football etc.)
  const { sportKey } = useParams();
  const navigate = useNavigate();

  // stores all grounds of selected sport
  const [grounds, setGrounds] = useState<any[]>([]);

  // fetch facilities from backend
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/facilities")
      .then((res) => {
        const all = res.data.data || [];

        // filter only grounds of selected sport
        
        const sportToCategoryMap: any = {
            football: "turf",
            cricket: "turf",
            badminton: "badminton",
            tennis: "court",
            gym: "gym",
            swimming: "pool",
            yoga: "studio",
            wrestling: "ring"
        };

        const filtered = all.filter(
            (f: any) => f.sportKey === sportKey//(f: any) => f.category === sportToCategoryMap[sportKey as string]
        );

        setGrounds(filtered);
      })
      .catch((err) => console.error(err));
  }, [sportKey]);

  return (
    <Layout>
      <section className="py-10 bg-background">
        <div className="container mx-auto px-2"> {/* change size of card*/}

          {/* BACK BUTTON */}
          <button
            onClick={() => navigate("/facilities")}
            className="flex items-center gap-2 text-sm mb-6 text-muted-foreground hover:text-primary"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Sports
          </button>

          {/* PAGE TITLE */}
          <h1 className="text-2xl font-semibold mb-8 capitalize">
            {sportKey}
          </h1>
            {/* GROUNDS STRIP LIST */}
            <div className="space-y-6">
              {grounds.map((ground) => (
                <div
                key={ground.id}
                    onClick={() => navigate(`/booking/${ground.id}`)}
                    className="
                        relative
                        h-52
                        rounded-2xl
                        overflow-hidden
                        cursor-pointer
                        shadow-lg
                        hover:shadow-2xl
                        transition-all
                        group
                "
                >

                {/* FULL WIDTH IMAGE */}
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
                        duration-300
                        group-hover:scale-105
                    "
                />

                {/* DARK OVERLAY – appears on hover */}
                <div
                    className="
                        absolute inset-0
                        bg-black/60
                        opacity-0
                        group-hover:opacity-100
                        transition-opacity
                        duration-300
                        flex
                        items-center
                    "
                >
                    {/* DETAILS ON HOVER */}
                    <div className="px-6 text-white">
                        <h3 className="text-xl font-semibold mb-1">
                            {ground.name}
                        </h3>

                    <p className="text-sm mb-2">
                        ₹{ground.pricePerHour}/hour
                    </p>

                    {/* AMENITIES */}
                    <div className="flex flex-wrap gap-2">
                        {ground.amenities?.map((a: string, i: number) => (
                        <span
                            key={i}
                            className="text-xs bg-white/20 px-2 py-1 rounded-full"
                        >
                            {a}
                        </span>
                        ))}
                    </div>
                    </div>
                </div>
                </div>
            ))}
        </div>


          {/* EMPTY STATE */}
          {grounds.length === 0 && (
            <p className="text-muted-foreground mt-10">
              No grounds available for this sport.
            </p>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Grounds;
