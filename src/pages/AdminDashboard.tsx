import axios from "axios";
import { useEffect, useState } from "react";
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
   Static Dashboard Data (KEPT FOR FUTURE)
========================= */
// const stats = [
//   { label: "Total Members", value: "5,234", change: "+12%", trend: "up", icon: Users },
//   { label: "Active Bookings", value: "142", change: "+8%", trend: "up", icon: Calendar },
//   { label: "Monthly Revenue", value: "$87,430", change: "+23%", trend: "up", icon: DollarSign },
//   { label: "Attendance Rate", value: "89%", change: "-2%", trend: "down", icon: TrendingUp },
// ];

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

  /* ---------- STATE ---------- */
  const [view, setView] = useState<"dashboard" | "members" | "activeBookings">("dashboard");
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  


  const [dashboardStats, setDashboardStats] = useState({
    totalMembers: 0,
    activeBookings: 0,
    recentMembers: [],
    todaysBookings: [],
  });

  const [dashboard, setDashboard] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

/* =========================
   FETCH USER DETAILS
========================= */
  const fetchUserDetails = async (id: number) => {
    try {
      const token = localStorage.getItem("token");

      const [userRes, bookingRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:5000/api/users/${id}/bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setSelectedUser(userRes.data.data);
      setUserBookings(bookingRes.data.data);
      setIsDrawerOpen(true);
    } catch (err) {
      console.error(err);
    }
  };


  /* ---------- FETCH DASHBOARD ---------- */
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:5000/api/admin/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setDashboard(res.data.data);

        setDashboardStats({
          totalMembers: res.data.data.totalMembers,
          activeBookings: res.data.data.activeBookings,
          recentMembers: res.data.data.recentMembers || [],
          todaysBookings: res.data.data.todaysBookings || [],
        });
      } catch (err) {
        console.error("Dashboard error", err);
      }
    };

    fetchDashboard();
  }, []);


/* -------- MEMBERS FETCH -------- */

const fetchUsers = async () => {
  try {
    setLoadingUsers(true);
    const token = localStorage.getItem("token");

    const res = await axios.get("http://localhost:5000/api/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setUsers(res.data.data.users || []);
  } catch (err) {
    console.error("Users fetch error", err);
  } finally {
    setLoadingUsers(false);
  }
};

/* -------- FETCH ON VIEW CHANGE -------- */

useEffect(() => {
  if (view !== "members") return;
  fetchUsers();
}, [view]);

/* -------- SOFT DELETE (DISABLE USER) -------- */

const disableUser = async (id: number) => {
  try {
    const token = localStorage.getItem("token");

    await axios.put(
      `http://localhost:5000/api/users/${id}/disable`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    fetchUsers(); // ✅ refresh list after disable
  } catch (err) {
    console.error("Disable user error", err);
  }
};



  return (
    <div className="min-h-screen bg-background flex">
      {/* ================= Sidebar ================= */}
      <aside className="hidden lg:flex flex-col w-64 border-r bg-card">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold">SportHub Admin</span>
          </div>
        </div>

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

          <Button variant="destructive" className="w-full" onClick={handleAdminLogout}>
            Logout
          </Button>
        </div>
      </aside>

      {/* ================= Main ================= */}
      <div className="flex-1 flex flex-col">
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

        <main className="flex-1 p-6 overflow-auto">
          <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-muted-foreground mb-6">
            Welcome back! Here's what's happening today.
          </p>

          {/* ================= STATS ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              {
                label: "Total Members",
                value: dashboardStats.totalMembers,
                key: "members",
                icon: Users,
                trend: "up",
                change: "",
              },
              {
                label: "Active Bookings",
                value: dashboardStats.activeBookings,
                key: "bookings",
                icon: Calendar,
                trend: "up",
                change: "",
              },
            ].map((stat, i) => (
              <Card
                key={i}
                className="cursor-pointer"
                onClick={() => {
                  if (stat.key === "members") setView("members");
                  if (stat.key === "bookings") setView("activeBookings");
                }}
              >
                <CardContent className="p-5">
                  <div className="flex justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm flex items-center gap-1 text-accent">
                      {stat.change}
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ================= MEMBERS TABLE ================= */}
            {view === "members" && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>All Members</CardTitle>
                </CardHeader>

                <CardContent>
                  {loadingUsers ? (
                    <p className="text-muted-foreground">Loading members...</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b">
                          <tr className="text-left">
                            <th className="py-2">Username</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th className="text-right">Actions</th>
                          </tr>
                        </thead>

                        <tbody>
                          {users.map((u) => (
                            <tr key={u.id} className="border-b hover:bg-muted/50">
                              <td className="py-2 font-medium">{u.username}</td>
                              <td>{u.firstName} {u.lastName}</td>
                              <td>{u.email}</td>
                              <td>{u.phone || "-"}</td>
                              <td>
                                <Badge variant="outline">{u.role}</Badge>
                              </td>
                              <td>
                                <Badge variant={u.isActive ? "default" : "secondary"}>
                                  {u.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </td>
                              <td className="text-right space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => fetchUserDetails(u.id)}
                                  >
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => disableUser(u.id)}
                                  >
                                    Disable
                                  </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

          {/* ================= RECENT ================= */}
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
                    <Badge variant={b.status === "confirmed" ? "default" : "secondary"}>
                      {b.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          {isUserModalOpen && userDetails && (
            <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
              <div className="w-full sm:w-[420px] bg-background h-full p-6 overflow-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">User Details</h2>
                  <button
                    className="text-muted-foreground"
                    onClick={() => setIsUserModalOpen(false)}
                  >
                    ✕
                  </button>
                </div>

                {/* User Info */}
                <div className="space-y-2 mb-6">
                  <p><b>Username:</b> {userDetails.username}</p>
                  <p><b>Name:</b> {userDetails.firstName} {userDetails.lastName}</p>
                  <p><b>Email:</b> {userDetails.email}</p>
                  <p><b>Phone:</b> {userDetails.phone || "-"}</p>
                  <p><b>Role:</b> {userDetails.role}</p>
                  <p><b>Status:</b> {userDetails.isActive ? "Active" : "Inactive"}</p>
                </div>

                {/* Membership */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Membership</h3>
                  {userDetails.membership ? (
                    <div className="space-y-1">
                      <p><b>Plan:</b> {userDetails.membership.plan_name}</p>
                      <p><b>Status:</b> {userDetails.membership.status}</p>
                      <p><b>Start:</b> {userDetails.membership.start_date}</p>
                      <p><b>End:</b> {userDetails.membership.end_date}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No membership</p>
                  )}
                </div>
                <h3 className="mt-6 mb-2 font-semibold text-lg">Bookings</h3>

                {/* =========================
                    USER BOOKINGS SECTION
                ========================= */}
                  {userBookings.length === 0 ? (
                    <p className="text-muted-foreground">No bookings found</p>
                  ) : (
                    <div className="space-y-2">
                      {userBookings.map((b) => (
                        <div
                          key={b.id}
                          className="flex justify-between items-center border rounded-lg p-3"
                        >
                          <div>
                            <p className="font-medium">{b.facility_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {b.booking_date} • {b.start_time} - {b.end_time}
                            </p>
                          </div>

                          <Badge
                            variant={b.status === "confirmed" ? "default" : "secondary"}
                          >
                            {b.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}


                {/* Actions */}
                <Button
                  variant="destructive"
                  className="w-full"
                >
                  Delete User
                </Button>
              </div>
            </div>
          )}

          {/* ================= USER DETAILS DRAWER ================= */}
          {isDrawerOpen && selectedUser && (
            <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
              <div className="w-[420px] bg-background h-full p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">User Details</h2>
                  <button onClick={() => setIsDrawerOpen(false)}>✕</button>
                </div>

                <div className="space-y-2">
                  <p><b>Username:</b> {selectedUser.username}</p>
                  <p><b>Name:</b> {selectedUser.firstName} {selectedUser.lastName}</p>
                  <p><b>Email:</b> {selectedUser.email}</p>
                  <p><b>Phone:</b> {selectedUser.phone || "-"}</p>
                  <p><b>Role:</b> {selectedUser.role}</p>
                  <p><b>Status:</b> {selectedUser.isActive ? "Active" : "Inactive"}</p>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Membership</h3>
                  {selectedUser.membership ? (
                    <p>{selectedUser.membership.plan_name}</p>
                  ) : (
                    <p className="text-muted-foreground">No membership</p>
                  )}
                </div>

                {/* 👇 NEXT STEP: BOOKINGS TABLE GOES HERE */}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
