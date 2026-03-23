import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100" role="main">
      <div className="text-center px-4">
        <h1 className="text-4xl font-bold mb-4">Page not found</h1>
        <p className="text-xl text-gray-600 mb-4" id="not-found-desc">
          The page you were looking for does not exist. You may have followed a broken link or mistyped the address.
        </p>
        <a
          href="/"
          className="text-blue-500 hover:text-blue-700 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
          aria-describedby="not-found-desc"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
