import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Auth from "./Auth";

const AuthWrapper = ({
  children,
  admin,
}: {
  children: React.JSX.Element;
  admin?: boolean;
}) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminStatus, setAdminStatus] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAuth = async () => {
      try {
        const result = await Auth();
        // console.log("Authentication result:", result);
        setIsAuthenticated(result.validation);
        setAdminStatus(result.admin);
      } catch {
        setIsAuthenticated(false);
        setAdminStatus(false);
      } finally {
        setIsLoading(false);
      }

      
    };
    fetchAuth();
  }, [isAuthenticated, adminStatus, isLoading, admin, navigate]);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated === false) {
        console.log("Something went wrong");
        navigate("/Login");
      } else if (admin !== undefined && adminStatus !== admin) {
        // Only check admin if the prop is provided
        navigate("/Login");
      }
    }
  }, [isAuthenticated, adminStatus, isLoading, admin, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-400 border-t-transparent mx-auto"></div>
          <h2 className="text-xl font-semibold text-white">Loading...</h2>
        </div>
      </div>
    );
  }

  if (
    isAuthenticated === true &&
    (admin === undefined || admin === adminStatus)
  ) {
    return <>{children}</>;
  }

  // While redirecting, render nothing (or a minimal fallback if you prefer)
  return null;
};

export default AuthWrapper;
