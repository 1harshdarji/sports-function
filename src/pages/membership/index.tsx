import { Layout } from "@/components/Layout";
import HeroSection from "./HeroSection";
import PlansSection from "./PlansSection";
import ComparisonTable from "./ComparisonTable";
import ActiveMembership from "./ActiveMembership";
import HowItWorks from "./HowItWorks";

const membership = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <main className="pt-16">
          <HeroSection />
          <PlansSection />
          <ComparisonTable />
          <ActiveMembership />
          <HowItWorks />
        </main>
      </div>
    </Layout>
  );
};

export default membership;
