import { Layout } from "@/components/Layout";
import EventsHero from "./EventsHero";
import EventCategories from "./Eventcategories";
import EventsList from "./EventsList";

const Events = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <EventsHero />

      {/* Category Navigation */}
      <EventCategories />

      {/* Events Listing */}
      <EventsList />
    </Layout>
  );
};

export default Events;
