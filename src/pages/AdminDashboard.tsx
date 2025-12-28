import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  BarChart3,
  Activity,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Bell,
  Search,
  Menu,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "react-router-dom";

/* =========================
   Admin Logout (ADMIN ONLY)
========================= */
const handleAdminLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  window.location.href = "/login";
};

/* =========================
   Static Dashboard Data
========================= */
const stats = [
  { label: "Total Members", value: "5,234", change: "+12%", trend: "up", icon: Users },
  { label: "Active Bookings", value: "142", change: "+8%", trend: "up", icon: Calendar },
  { label: "Monthly Revenue", value: "$87,430", change: "+23%", trend: "up", icon: DollarSign },
  { label: "Attendance Rate", value: "89%", change: "-2%", trend: "down", icon: TrendingUp },
];

const recentMembers = [
  { name: "Sarah Johnson", email: "sarah@example.com", plan: "Premium", joined: "Today" },
  { name: "Michael Chen", email: "michael@example.com", plan: "Elite", joined: "Yesterday" },
  { name: "Emily Williams", email: "emily@example.com", plan: "Basic", joined: "2 days ago" },
  { name: "David Brown", email: "david@example.com", plan: "Premium", joined: "3 days ago" },
];

const recentBookings = [
  { member: "John Doe", facility: "Tennis Court 2", time: "10:00 AM", status: "confirmed" },
  { member: "Jane Smith", facility: "Swimming Pool", time: "11:00 AM", status: "pending" },
  { member: "Bob Wilson", facility: "Fitness Center", time: "2:00 PM", status: "confirmed" },
  { member: "Alice Brown", facility: "Yoga Studio", time: "4:00 PM", status: "confirmed" },
];

const sidebarLinks = [
  { label: "Dashboard", icon: BarChart3, href: "/admin" },
  { label: "Members", icon: Users, href: "/admin/members" },
  { label: "Bookings", icon: Calendar, href: "/admin/bookings" },
  { label: "Coaches", icon: Activity, href: "/admin/coaches" },
  { label: "Revenue", icon: DollarSign, href: "/admin/revenue" },
];

/* =========================
   Admin Dashboard Component
========================= */
const AdminDashboard = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex">
      {/* ================= Sidebar ================= */}
      <aside className="hidden lg:flex flex-col w-64 border-r bg-card">
        {/* Logo */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold">SportHub Admin</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {sidebarLinks.map((link, i) => (
              <li key={i}>
                <Link
                  to={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    location.pathname === link.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Admin Footer */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              👤
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Admin User</p>
              <p className="text-xs text-muted-foreground">admin@sporthub.com</p>
            </div>
          </div>

          <Button
            variant="destructive"
            className="w-full"
            onClick={handleAdminLogout}
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* ================= Main Content ================= */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="w-5 h-5" />
            </Button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-9 w-64" />
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
        </header>

        {/* Dashboard */}
        <main className="flex-1 p-6 overflow-auto">
          <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-muted-foreground mb-6">
            Welcome back! Here's what's happening today.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="flex justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span
                      className={`text-sm flex items-center gap-1 ${
                        stat.trend === "up" ? "text-accent" : "text-destructive"
                      }`}
                    >
                      {stat.change}
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                    </span>
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Members + Bookings */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Members</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentMembers.map((m, i) => (
                  <div key={i} className="flex justify-between">
                    <div>
                      <p className="font-medium text-sm">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                    </div>
                    <Badge variant="outline">{m.plan}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Today's Bookings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentBookings.map((b, i) => (
                  <div key={i} className="flex justify-between">
                    <div>
                      <p className="font-medium text-sm">{b.member}</p>
                      <p className="text-xs text-muted-foreground">{b.facility}</p>
                    </div>
                    <Badge
                      variant={b.status === "confirmed" ? "default" : "secondary"}
                    >
                      {b.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
