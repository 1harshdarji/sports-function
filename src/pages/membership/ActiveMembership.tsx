import { Calendar, Clock, Gift, ArrowUpRight, RefreshCw, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const ActiveMembership = () => {
  // Placeholder data - will be replaced with real backend data
  const membershipData = {
    planName: "Pro Membership",
    startDate: "Jan 1, 2025",
    expiryDate: "Dec 31, 2025",
    daysRemaining: 248,
    totalDays: 365,
  };

  const progressPercentage = ((membershipData.totalDays - membershipData.daysRemaining) / membershipData.totalDays) * 100;

  return (
    <section className="py-24 bg-[#f8fafc]">
      <div className="container px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0f172a] mb-4">
            Your <span className="text-gradient">Active Membership</span>
          </h2>
          <p className="text-[#6b7280] text-lg">
            Track your membership status and manage your benefits.
          </p>
        </div>

        {/* Membership Card */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#ffffff] rounded-2xl border border-[#e5e7eb] p-8 card-shadow">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffedd5] text-[#f97316] text-sm font-medium mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#f97316] animate-pulse-soft" />
                  Active
                </div>
                <h3 className="font-display text-2xl font-bold text-[#0f172a]">
                  {membershipData.planName}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-[#6b7280]">
                <Gift className="w-5 h-5 text-[#f97316]" />
                <span className="text-sm font-medium">Premium Benefits Active</span>
              </div>
            </div>

            {/* Dates */}
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[#f9fafb]">
                <div className="w-10 h-10 rounded-lg bg-[#ffedd5] flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#f97316]" />
                </div>
                <div>
                  <div className="text-sm text-[#6b7280]">Start Date</div>
                  <div className="font-semibold text-[#0f172a]">{membershipData.startDate}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[#f9fafb]">
                <div className="w-10 h-10 rounded-lg bg-[#ffedd5] flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#f97316]" />
                </div>
                <div>
                  <div className="text-sm text-[#6b7280]">Expiry Date</div>
                  <div className="font-semibold text-[#0f172a]">{membershipData.expiryDate}</div>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-[#0f172a]">Membership Progress</span>
                <span className="text-sm text-[#6b7280]">
                  <span className="font-semibold text-[#f97316]">{membershipData.daysRemaining}</span> days remaining
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3 bg-[#f3f4f6]" />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="flex-1 h-12 font-semibold rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white">
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Upgrade Plan
              </Button>
              <Button variant="outline" className="flex-1 h-12 font-semibold rounded-xl border-[#e5e7eb] hover:bg-[#f9fafb]">
                <RefreshCw className="w-4 h-4 mr-2" />
                Renew Membership
              </Button>
              <Button variant="ghost" className="flex-1 h-12 font-semibold rounded-xl hover:bg-[#f9fafb]">
                <Eye className="w-4 h-4 mr-2" />
                View Benefits
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ActiveMembership;