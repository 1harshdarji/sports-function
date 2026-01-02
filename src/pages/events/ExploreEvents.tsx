const categories = [
  { label: "Music", img: "/images/categories/music.jpg" },
  { label: "Comedy", img: "/images/categories/comedy.jpg" },
  { label: "Performances", img: "/images/categories/performance.jpg" },
  { label: "Food & Drinks", img: "/images/categories/food.jpg" },
  { label: "Fests & Fairs", img: "/images/categories/fests.jpg" },
];

const ExploreEvents = () => {
  return (
    <section className="bg-white py-10">
      <div className="container mx-auto px-4">
        <h2 className="mb-6 text-2xl font-semibold">Explore Events</h2>

        {/* STATIC GRID – 6 PER ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((cat) => (
            <div>
              {/* IMAGE ONLY */}
              <div className="aspect-[3/4] w-full">
                <img
                  src={cat.img}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default ExploreEvents;
