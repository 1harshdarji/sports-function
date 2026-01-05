import { Music, Laugh, Theater, Utensils, PartyPopper, Mic2 } from "lucide-react";

const categories = [
  { label: "Music", icon: Music, color: "from-rose-500 to-pink-600" },
  { label: "Comedy", icon: Laugh, color: "from-amber-500 to-orange-600" },
  { label: "Theatre", icon: Theater, color: "from-violet-500 to-purple-600" },
  { label: "Food & Drinks", icon: Utensils, color: "from-emerald-500 to-teal-600" },
  { label: "Festivals", icon: PartyPopper, color: "from-blue-500 to-indigo-600" },
  { label: "Podcasts", icon: Mic2, color: "from-red-500 to-rose-600" },
];

const EventCategories = () => {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Explore by Category
          </h2>
          <button className="text-accent font-medium hover:underline">
            View All
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.label}
                className="group flex flex-col items-center gap-3 p-4 rounded-xl bg-card card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default EventCategories;