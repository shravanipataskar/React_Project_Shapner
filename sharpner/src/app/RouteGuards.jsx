import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./authContext.js";
import {
  hasAdminAccess,
  hasSuperAdminAccess,
} from "../utils/userTypes.js";

export function ProtectedRoute() {
  const { status, retryAuth } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return null;
  }

  if (status === "error") {
    return (
      <main role="alert">
        <p>Unable to verify your session. Please try again.</p>
        <button type="button" onClick={retryAuth}>
          Retry
        </button>
      </main>
    );
  }

  if (status !== "authenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function AdminFeatureRoute() {
  const { user } = useAuth();

  if (!hasAdminAccess(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export function SuperAdminFeatureRoute() {
  const { user } = useAuth();

  if (!hasSuperAdminAccess(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export function GuestRoute({ children }) {
  const { status } = useAuth();

  if (status === "loading") {
    return null;
  }

  if (status === "authenticated") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
