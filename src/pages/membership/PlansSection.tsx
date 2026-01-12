import PlanCard from "./PlanCard";

const plans = [
  {
    name: "Starter",
    price: "₹499",
    description: "Perfect for beginners looking to explore sports facilities at their own pace.",
    benefits: [
      "Limited facility access",
      "Standard booking slots",
      "Basic customer support",
      "Access to community events",
    ],
    variant: "starter" as const,
  },
  {
    name: "Pro",
    price: "₹1,499",
    description: "Ideal for regular athletes who want priority access and exclusive perks.",
    benefits: [
      "All facilities access",
      "Priority booking slots",
      "Discounted event tickets",
      "Free cancellations",
      "Monthly performance reports",
    ],
    variant: "pro" as const,
    popular: true,
  },
  {
    name: "Elite",
    price: "₹2,999",
    description: "The ultimate membership for serious athletes demanding the best experience.",
    benefits: [
      "Unlimited access everywhere",
      "Top priority booking",
      "Coach session discounts",
      "Guest passes (2/month)",
      "Dedicated support line",
      "Exclusive member events",
    ],
    variant: "elite" as const,
  },
];

const PlansSection = () => {
  return (
    <section id="plans" className="py-24 bg-[#f8fafc]">
      <div className="container px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0f172a] mb-4">
            Choose Your <span className="text-gradient">Perfect Plan</span>
          </h2>
          <p className="text-[#6b7280] text-lg">
            Flexible memberships designed for every athlete, from casual players to professionals.
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-start">
          {plans.map((plan) => (
            <PlanCard key={plan.name} {...plan} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlansSection;
