import { ArrowDown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const scrollToPlans = () => {
    document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-hero-pattern">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#fff7ed] via-[#ffedd5] to-[#ffffff] opacity-70" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#f97316]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#f97316]/10 rounded-full blur-3xl" />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-[#ffedd5] border border-[#f97316]/20 animate-fade-in">
            <Zap className="w-4 h-4 text-[#f97316]" />
            <span className="text-sm font-medium text-[#f97316]">SportHub Memberships</span>
          </div>

          {/* Main heading */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#0f172a] leading-tight mb-6 animate-fade-in-up">
            Memberships that{" "}
            <span className="text-[#f97316]">power</span>
            <br />
            your sports journey
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-[#6b7280] max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Access world-class facilities, book faster than ever, and unlock exclusive benefits designed for athletes who demand more.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <Button 
              size="lg" 
              onClick={scrollToPlans}
              className="h-14 px-8 text-lg font-semibold rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              View Plans
              <ArrowDown className="ml-2 w-5 h-5" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-12 border-t border-[#e5e7eb]/50 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <div>
              <div className="text-3xl sm:text-4xl font-display font-bold text-[#0f172a]">50K+</div>
              <div className="text-sm text-[#6b7280] mt-1">Active Members</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-display font-bold text-[#0f172a]">200+</div>
              <div className="text-sm text-[#6b7280] mt-1">Partner Venues</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-display font-bold text-[#0f172a]">98%</div>
              <div className="text-sm text-[#6b7280] mt-1">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
