import { CreditCard, Zap, CalendarCheck, Settings } from "lucide-react";

const steps = [
  {
    icon: Settings,
    title: "Choose Your Plan",
    description: "Select from Starter, Pro, or Elite based on your training needs.",
  },
  {
    icon: CreditCard,
    title: "Pay Securely",
    description: "Complete your payment through our secure checkout process.",
  },
  {
    icon: Zap,
    title: "Get Instant Access",
    description: "Your membership activates immediately after payment confirmation.",
  },
  {
    icon: CalendarCheck,
    title: "Manage Bookings",
    description: "Book facilities, access benefits, and track your sports journey.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0f172a] mb-4">
            How It <span className="text-[#f97316]">Works</span>
          </h2>
          <p className="text-[#6b7280] text-lg">
            Get started with your SportHub membership in four simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-[#f97316]/20 via-[#f97316] to-[#f97316]/20" />

            {steps.map((step, index) => (
              <div key={step.title} className="relative">
                {/* Step number + icon */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-[#ffedd5] flex items-center justify-center mb-4 transition-transform duration-300 hover:scale-110">
                      <step.icon className="w-8 h-8 text-[#f97316]" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#f97316] text-white flex items-center justify-center font-display font-bold text-sm">
                      {index + 1}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="font-display text-lg font-bold text-[#0f172a] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#6b7280] leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Mobile connector */}
                {index < steps.length - 1 && (
                  <div className="md:hidden flex justify-center my-6">
                    <div className="w-0.5 h-8 bg-gradient-to-b from-[#f97316] to-[#f97316]/20" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;