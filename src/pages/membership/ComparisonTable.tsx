import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

type FeatureValue = boolean | string;

interface Feature {
  name: string;
  starter: FeatureValue;
  pro: FeatureValue;
  elite: FeatureValue;
}

const features: Feature[] = [
  {
    name: "Facility Access",
    starter: "Limited",
    pro: "All facilities",
    elite: "Unlimited",
  },
  {
    name: "Booking Priority",
    starter: "Standard",
    pro: "Priority",
    elite: "Top Priority",
  },
  {
    name: "Event Discounts",
    starter: false,
    pro: "10% off",
    elite: "25% off",
  },
  {
    name: "Coach Discounts",
    starter: false,
    pro: false,
    elite: "15% off",
  },
  {
    name: "Guest Access",
    starter: false,
    pro: false,
    elite: "2 passes/month",
  },
  {
    name: "Cancellation Flexibility",
    starter: "24hr notice",
    pro: "Free cancellation",
    elite: "Anytime",
  },
];

const ValueCell = ({ value }: { value: FeatureValue }) => {
  if (typeof value === "boolean") {
    return value ? (
      <div className="w-6 h-6 rounded-full bg-[#ffedd5] flex items-center justify-center mx-auto">
        <Check className="w-4 h-4 text-[#f97316]" />
      </div>
    ) : (
      <div className="w-6 h-6 rounded-full bg-[#f3f4f6] flex items-center justify-center mx-auto">
        <X className="w-4 h-4 text-[#6b7280]" />
      </div>
    );
  }
  return <span className="text-[#0f172a] font-medium">{value}</span>;
};

const ComparisonTable = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0f172a] mb-4">
            Compare <span className="text-gradient">All Plans</span>
          </h2>
          <p className="text-[#6b7280] text-lg">
            Find the perfect membership that fits your training needs and budget.
          </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block max-w-4xl mx-auto">
          <div className="bg-[#ffffff] rounded-2xl border border-[#e5e7eb] overflow-hidden card-shadow">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e5e7eb]">
                  <th className="text-left p-6 font-display font-semibold text-[#0f172a]">Features</th>
                  <th className="p-6 text-center">
                    <span className="font-display font-semibold text-[#0f172a]">Starter</span>
                    <div className="text-sm text-[#6b7280] mt-1">₹499/mo</div>
                  </th>
                  <th className="p-6 text-center bg-[#ffedd5]/50">
                    <span className="font-display font-semibold text-[#f97316]">Pro</span>
                    <div className="text-sm text-[#f97316]/80 mt-1">₹1,499/mo</div>
                  </th>
                  <th className="p-6 text-center">
                    <span className="font-display font-semibold text-[#0f172a]">Elite</span>
                    <div className="text-sm text-[#6b7280] mt-1">₹2,999/mo</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr 
                    key={feature.name} 
                    className={cn(
                      "border-b border-[#e5e7eb] last:border-b-0",
                      index % 2 === 0 && "bg-[#f9fafb]"
                    )}
                  >
                    <td className="p-6 font-medium text-[#0f172a]">{feature.name}</td>
                    <td className="p-6 text-center"><ValueCell value={feature.starter} /></td>
                    <td className="p-6 text-center bg-[#ffedd5]/30"><ValueCell value={feature.pro} /></td>
                    <td className="p-6 text-center"><ValueCell value={feature.elite} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-6">
          {["Starter", "Pro", "Elite"].map((plan) => (
            <div 
              key={plan}
              className={cn(
                "rounded-2xl p-6 border",
                plan === "Pro" 
                  ? "bg-[#ffedd5]/50 border-[#f97316]/30" 
                  : "bg-[#ffffff] border-[#e5e7eb]"
              )}
            >
              <h3 className={cn(
                "font-display font-bold text-xl mb-4",
                plan === "Pro" ? "text-[#f97316]" : "text-[#0f172a]"
              )}>
                {plan}
              </h3>
              <ul className="space-y-4">
                {features.map((feature) => {
                  const value = feature[plan.toLowerCase() as keyof Pick<Feature, 'starter' | 'pro' | 'elite'>];
                  return (
                    <li key={feature.name} className="flex items-center justify-between">
                      <span className="text-[#6b7280] text-sm">{feature.name}</span>
                      <ValueCell value={value} />
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComparisonTable;