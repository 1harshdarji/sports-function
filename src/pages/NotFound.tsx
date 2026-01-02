import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-xl text-muted-foreground">
          Oops! Page not found
        </p>

        <div className="flex justify-center gap-6">
          <Link to="/profile" className="text-primary underline">
            Go to Profile
          </Link>

          <Link to="/events" className="text-primary underline">
            Browse Events
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
