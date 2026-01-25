import { Check, Star, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface PlanCardProps {
  name: string;
  price: string;
  description: string;
  benefits: string[];
  variant: "starter" | "pro" | "elite";
  popular?: boolean;
  activeMembership: any;
}

const calculateDaysRemaining = (endDate: string) => {
  const end = new Date(endDate).getTime();
  const now = Date.now();
  return Math.max(Math.ceil((end - now) / (1000 * 60 * 60 * 24)), 0);
};

const PlanCard = ({ name, price, description, benefits, variant, popular,activeMembership, }: PlanCardProps) => {
  const isProVariant = variant === "pro";
  const isEliteVariant = variant === "elite";
  const navigate = useNavigate();


  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl p-8 transition-all duration-500 hover:-translate-y-2",
        isProVariant && "bg-gradient-to-b from-[#f97316] to-[#ea580c] text-white pro-shadow scale-105 z-10",
        isEliteVariant && "bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white elite-shadow",
        !isProVariant && !isEliteVariant && "bg-[#ffffff] border border-[#e5e7eb] card-shadow hover:card-shadow-hover"
      )}
    >
      {/* Popular badge */}
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-[#f97316] text-sm font-semibold shadow-lg">
            <Star className="w-4 h-4 fill-[#f97316]" />
            Most Popular
          </div>
        </div>
      )}

      {/* Plan icon */}
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center mb-6",
        isProVariant && "bg-white/20",
        isEliteVariant && "bg-white/10",
        !isProVariant && !isEliteVariant && "bg-[#ffedd5]"
      )}>
        {isEliteVariant ? (
          <Crown className={cn("w-6 h-6", isEliteVariant ? "text-white" : "text-[#f97316]")} />
        ) : (
          <Star className={cn("w-6 h-6", isProVariant ? "text-white" : "text-[#f97316]")} />
        )}
      </div>

      {/* Plan name */}
      <h3 className={cn(
        "font-display text-2xl font-bold mb-2",
        !isProVariant && !isEliteVariant && "text-[#0f172a]"
      )}>
        {name}
      </h3>

      {/* Price */}
      <div className="mb-4">
        <span className={cn(
          "font-display text-4xl font-bold",
          !isProVariant && !isEliteVariant && "text-[#0f172a]"
        )}>
          {price}
        </span>
        <span className={cn(
          "text-sm ml-1",
          isProVariant || isEliteVariant ? "opacity-80" : "text-[#6b7280]"
        )}>
          /month
        </span>
      </div>

      {/* Description */}
      <p className={cn(
        "text-sm mb-8 leading-relaxed",
        isProVariant || isEliteVariant ? "opacity-90" : "text-[#6b7280]"
      )}>
        {description}
      </p>

      {/* Benefits */}
      <ul className="space-y-4 mb-8 flex-1">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
              isProVariant && "bg-white/20",
              isEliteVariant && "bg-[#f97316]/20",
              !isProVariant && !isEliteVariant && "bg-[#ffedd5]"
            )}>
              <Check className={cn(
                "w-3 h-3",
                isProVariant ? "text-white" : isEliteVariant ? "text-[#f97316]" : "text-[#f97316]"
              )} />
            </div>
            <span className={cn(
              "text-sm",
              !isProVariant && !isEliteVariant && "text-[#0f172a]"
            )}>
              {benefit}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <Button
        size="lg"
        onClick={() => {
          if (activeMembership) {
            alert(
              `You are currently on ${activeMembership.plan_name}.\n` +
              `You can renew or book a new plan after ` +
              `${calculateDaysRemaining(activeMembership.end_date)} days.`
            );
            return;
          }

          navigate(`/membership/checkout/${variant}`);
        }}
        className={cn(
          "w-full h-12 font-semibold rounded-xl transition-all duration-300",
          isProVariant && "bg-white text-[#f97316] hover:bg-white/90",
          isEliteVariant && "bg-[#f97316] text-white hover:bg-[#ea580c]",
          !isProVariant && !isEliteVariant && "bg-[#f97316] text-white hover:bg-[#ea580c]"
        )}
      >
        Choose {name}
      </Button>
    </div>
  );
};

export default PlanCard;