import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Settings, 
  Calendar, 
  CreditCard, 
  Bell, 
  Trophy,
  Clock,
  Edit,
  Camera
} from "lucide-react";
const formatDateOnly = (dateString: string) => {
  const [year, month, day] = dateString.split("T")[0].split("-");
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
const achievements = [
  { title: "Early Bird", description: "Complete 10 morning sessions", progress: 8, total: 10 },
  { title: "Swimmer", description: "Swim 50 laps total", progress: 35, total: 50 },
  { title: "Social Butterfly", description: "Attend 5 group classes", progress: 5, total: 5 },
];

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  age: number;
  gender: string;
  phone: string;
}

const Profile = () => {
  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  window.location.href = "/";
};
const handleSaveProfile = async () => {
  try {
    const token = localStorage.getItem("token");

    await axios.put(
      "http://localhost:8080/api/profile",
      {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Profile updated successfully");
  } catch (error) {
    console.error("Profile update failed", error);
    alert("Failed to update profile");
  }
};

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview"); // ✅ ADD
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
  });
  
  useEffect(() => {
    if (activeTab !== "bookings") return;

    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:5000/api/bookings/my",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUserBookings(res.data?.data ?? []);
      } catch (err) {
        console.error("Bookings fetch failed", err);
      }
    };
    fetchBookings();
  }, [activeTab]);

  useEffect(() => {
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:8080/api/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ✅ FIX: always read from res.data.data
      const userData = res.data?.data;

      if (!userData) {
        throw new Error("User data missing");
      }

      setUser(userData);
      setFormData({
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        phone: userData.phone || "",
      });
    } catch (err) {
      console.error("Profile fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, []);

if (loading) {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        Loading profile...
      </div>
    </Layout>
  );
}
  return (
    <Layout>
      {/* Profile Header */}
      <section className="py-8 md:py-12 gradient-hero">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-secondary flex items-center justify-center text-4xl md:text-5xl shadow-coral">
                👤
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-card flex items-center justify-center shadow-card">
                <Camera className="w-4 h-4 text-foreground" />
              </button>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground">{user?.first_name} {user?.last_name}</h1>
              <p className="text-primary-foreground/70">  {user?.email} </p>
              <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                <Badge className="gradient-coral text-secondary-foreground border-0">Premium Member</Badge>
                <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground">
                  Since 2021
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <section className="py-8 md:py-12 bg-background">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="w-full justify-start overflow-x-auto bg-muted p-1 rounded-lg">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Bookings
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Billing
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Stats Cards */}
                {[
                  { label: "Sessions This Month", value: "12", icon: Clock, color: "bg-primary/10 text-primary" },
                  { label: "Active Bookings", value: "2", icon: Calendar, color: "bg-secondary/20 text-secondary" },
                  { label: "Achievements", value: "7", icon: Trophy, color: "bg-accent/20 text-accent" },
                ].map((stat, i) => (
                  <Card key={i} variant="elevated">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{stat.label}</p>
                          <p className="text-3xl font-bold">{stat.value}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                          <stat.icon className="w-6 h-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Achievements */}
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-secondary" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {achievements.map((achievement, i) => (
                      <div key={i} className="bg-muted rounded-xl p-4">
                        <h4 className="font-semibold mb-1">{achievement.title}</h4>
                        <p className="text-xs text-muted-foreground mb-3">{achievement.description}</p>
                        <div className="h-2 bg-card rounded-full overflow-hidden">
                          <div 
                            className="h-full gradient-coral"
                            style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {achievement.progress}/{achievement.total}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bookings" className="space-y-6">
              <Card variant="elevated">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">My Bookings</CardTitle>
                  <Button size="sm">New Booking</Button>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {userBookings.length === 0 && (
                      <p className="text-muted-foreground">No bookings yet</p>
                    )}

                    {userBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 bg-muted rounded-xl"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-primary" />
                          </div>

                          <div>
                            <h4 className="font-semibold">
                              {booking.facility?.name ?? "Unknown Facility"}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {booking.date ? formatDateOnly(booking.date) : "Date N/A"}
                              {" | "}
                              {booking.startTime} – {booking.endTime}
                            </p>
                          </div>
                        </div>

                        <Badge
                          variant={
                            booking.status === "confirmed"
                              ? "default"
                              : booking.status === "pending"
                              ? "secondary"
                              : "outline" // FIX: don't hide unknown states
                          }
                        >
                        
                          {booking.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="space-y-6">
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-lg">Current Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl gradient-coral flex items-center justify-center shadow-coral">
                        <span className="text-xl">⭐</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Premium Plan</h4>
                        <p className="text-sm text-muted-foreground">$59/month • Renews Jan 13, 2025</p>
                      </div>
                    </div>
                    <Button variant="outline">Manage</Button>
                  </div>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-lg">Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-card flex items-center justify-center border">
                        <CreditCard className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">•••• •••• •••• 4242</h4>
                        <p className="text-sm text-muted-foreground">Expires 12/26</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input value={user?.first_name || ""} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input value={formData.last_name}  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })  }/>
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={user?.email || ""} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input  value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })  }/>
                    </div>
                  </div>
                  <Button onClick={handleSaveProfile}> Save Changes </Button>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["Booking reminders", "Event updates", "Promotional offers", "Weekly summary"].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span>{item}</span>
                        <input type="checkbox" defaultChecked={i < 2} className="w-5 h-5 accent-secondary" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle className="text-lg text-destructive">
                      Account Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="destructive"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </CardContent>
                </Card>

            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default Profile;
