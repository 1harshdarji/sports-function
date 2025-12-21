import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import { 
  ArrowRight, 
  Dumbbell, 
  Users, 
  Calendar, 
  Trophy, 
  Star,
  ChevronRight,
  Waves,
  Target,
  Clock
} from "lucide-react";
import heroImage from "@/assets/hero-sports.jpg";

const features = [
  {
    icon: Dumbbell,
    title: "World-Class Equipment",
    description: "State-of-the-art gym facilities with the latest fitness equipment for all your training needs."
  },
  {
    icon: Users,
    title: "Expert Coaches",
    description: "Professional trainers dedicated to helping you achieve your fitness goals with personalized guidance."
  },
  {
    icon: Calendar,
    title: "Flexible Booking",
    description: "Easy online booking system for facilities, classes, and personal training sessions."
  },
  {
    icon: Trophy,
    title: "Competitive Events",
    description: "Regular tournaments and events to challenge yourself and connect with fellow athletes."
  },
];

const facilities = [
  { name: "Swimming Pool", icon: Waves, slots: 12 },
  { name: "Tennis Courts", icon: Target, slots: 8 },
  { name: "Fitness Center", icon: Dumbbell, slots: 24 },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Member since 2021",
    content: "SportHub transformed my fitness journey. The coaches are amazing and the facilities are top-notch!",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Professional Athlete",
    content: "Best sports club I've ever been a part of. The community here is incredibly supportive.",
    rating: 5
  },
  {
    name: "Emily Williams",
    role: "Member since 2022",
    content: "Love the variety of classes and the flexible booking system. Highly recommend!",
    rating: 5
  },
];

const Index = () => {
  const token = localStorage.getItem("token");
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 gradient-dark opacity-80" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl animate-slide-up">
            <span className="inline-block px-4 py-2 rounded-full bg-secondary/20 text-secondary font-medium text-sm mb-6">
              Welcome to SportHub
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6">
              Elevate Your
              <span className="block text-secondary">Athletic Journey</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 leading-relaxed">
              Join our premier sports club and unlock your full potential with world-class facilities, 
              expert coaching, and a vibrant community of athletes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {!token && (
                <Link to="/register">
                  <Button variant="hero" size="xl" className="w-full sm:w-auto">
                    Get Started <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              )}
              <Link to="/facilities">
                <Button variant="hero-outline" size="xl" className="w-full sm:w-auto">
                  Explore Facilities
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Stats */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex gap-8">
          {[
            { value: "5000+", label: "Active Members" },
            { value: "50+", label: "Expert Coaches" },
            { value: "25+", label: "Sports Programs" },
          ].map((stat, i) => (
            <div key={i} className="text-center text-primary-foreground">
              <div className="text-3xl font-bold text-secondary">{stat.value}</div>
              <div className="text-sm text-primary-foreground/70">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-secondary font-medium text-sm uppercase tracking-wider">Why Choose Us</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-muted-foreground">
              We provide comprehensive sports and fitness solutions designed to help you reach your peak performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <Card key={i} variant="feature" className="text-center p-6">
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 rounded-2xl gradient-coral flex items-center justify-center mx-auto mb-4 shadow-coral">
                    <feature.icon className="w-7 h-7 text-secondary-foreground" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Booking Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
              <span className="text-secondary font-medium text-sm uppercase tracking-wider">Book Now</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
                Reserve Your Spot Today
              </h2>
              <p className="text-muted-foreground mb-8">
                Book your favorite facilities in just a few clicks. Our easy-to-use booking system ensures you never miss a session.
              </p>
              <Link to="/facilities">
                <Button size="lg">
                  View All Facilities <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            
            <div className="flex-1 grid gap-4 w-full">
              {facilities.map((facility, i) => (
                <Card key={i} variant="elevated" className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <facility.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{facility.name}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {facility.slots} slots available today
                      </p>
                    </div>
                  </div>
                  <Link to="/facilities">
                    <Button variant="outline" size="sm">Book</Button>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-secondary font-medium text-sm uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
              What Our Members Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <Card key={i} variant="elevated" className="p-6">
                <CardContent className="pt-0">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-secondary text-secondary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join thousands of members who have transformed their lives at SportHub. 
            Start your free trial today!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {!token && (
              <Link to="/register">
                <Button variant="hero" size="xl">
                  Start Free Trial <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            )}
            <Link to="/membership">
              <Button variant="hero-outline" size="xl">
                View Membership Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
