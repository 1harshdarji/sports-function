import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Membership from "./pages/Membership";
import Facilities from "./pages/Facilities";
import Grounds from "./pages/Grounds"; //Added
import Booking from "./pages/Booking"; // Added
import EventsList from "@/pages/events/EventsList";
import EventDetails from "./pages/events/EventDetails";
import EventBooking from "@/pages/events/EventBooking";
import Events from "./pages/events/Events";
import Payment from "./pages/Payment";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminBookings from "./pages/AdminBookings";
import AdminRoute from "./pages/AdminRoute";
import Coaches from "./pages/Coaches";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/facilities" element={<Facilities />} />
          <Route path="/grounds/:sportKey" element={<Grounds />} />
          <Route path="/booking/:facilityId" element={<Booking />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:eventId" element={<EventDetails />} />
          <Route path="/events/:eventId/book" element={<EventBooking />} />
          <Route path="/events" element={<EventsList />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute> }/>
          <Route path="/admin/bookings" element={<AdminRoute><AdminBookings /></AdminRoute>}/>
          <Route path="/coaches" element={<Coaches />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
