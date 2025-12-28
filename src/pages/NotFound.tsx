import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  const user = localStorage.getItem("user");
  const role = user ? JSON.parse(user).role : null;

  useEffect(() => {
    console.error("404:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">
          Oops! Page not found
        </p>

        <Link
          to={role === "admin" ? "/admin" : "/"}
          className="text-primary underline"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
