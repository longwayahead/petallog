// src/app/AuthGate.tsx
import { useSession } from "../lib/auth-client";
import LoginPage from "../features/users/pages/LoginPage";
import {Navigate, useLocation} from "react-router-dom";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const location = useLocation();

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
