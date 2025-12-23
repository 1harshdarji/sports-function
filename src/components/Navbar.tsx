import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Dumbbell, User } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/membership", label: "Membership" },
  { href: "/facilities", label: "Facilities" },
  { href: "/events", label: "Events" },
  { href: "/coaches", label: "Coaches" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");



  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg gradient-hero flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">SportHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href}>
                <Button
                  variant="nav"
                  className={
                    location.pathname === link.href
                      ? "bg-muted text-primary"
                      : ""
                  }
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {!token ? (
              <>
                <Link to="/login">
                  <Button variant="ghost">Log In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="secondary">Join Now</Button>
                </Link>
              </>
            ) : (
              <Button
                variant="secondary"
                className="flex items-center gap-2 px-4"
                onClick={() => navigate("/profile")}
              >
                <User className="w-4 h-4" />
                <span className="capitalize">{username || "User"}</span>
              </Button>

            )}

          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-card border-b shadow-card animate-slide-up">
            <div className="flex flex-col p-4 gap-2">
              
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-lg transition-all ${
                    location.pathname === link.href
                      ? "bg-muted text-primary font-medium"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <hr className="my-2 border-border" />

              {!token ? (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Log In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)}>
                    <Button variant="secondary" className="w-full">
                      Join Now
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-2 font-medium py-2">
                    <User className="w-4 h-4" />
                    {username || "User"}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      navigate("/profile");
                      setIsOpen(false);
                    }}
                  >
                    Profile
                  </Button>

                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
