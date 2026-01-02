import { Layout } from "@/components/Layout";
import EventsHero from "./EventsHero";
import ExploreEvents from "./ExploreEvents";
import EventsList from "./EventsList";

const Events = () => {
  return (
    <Layout>
      {/* HERO SLIDER (auto sliding, transparent) */}
      <EventsHero />
      {/* CATEGORY CARDS (static images) */}
      <ExploreEvents />

      {/* EVENTS GRID */}
      <EventsList />
    </Layout>
  );
};

export default Events;
