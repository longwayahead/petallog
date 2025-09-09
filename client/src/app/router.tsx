// src/routes/router.tsx
import { createBrowserRouter, Navigate, useLocation } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import TabLayout from "./layouts/TabLayout";
import NoNavLayout from "./layouts/NoNavLayout";

import FeedPage from "../features/feed/pages/FeedPage";
import PlantsPage from "../features/search/pages/PlantsPage";
import NotificationsPage from "../features/tasks/pages/NotificationsPage";
import SettingsPage from "../features/settings/pages/SettingsPage";
import ScanScreen from "../features/scanner/pages/ScanScreen";
import CreateUserPage from "../features/users/pages/CreateUserPage";

import AuthGate from "../app/AuthGate";
import LoginPage from "../features/users/pages/LoginPage";

// Plant profile detail
import PlantProfilePage from "../features/plants/pages/PlantProfilePage";

function ScanScreenWrapper() {
  const location = useLocation();
  const returnTo = location.state?.returnTo || "/";

  return (
    <ScanScreen
      asPage={true}
      returnTo={returnTo}
      heading="Scan a pot"
      onClose={() => window.history.back()} // or navigate(returnTo)
    />
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <TabLayout />,
        children: [
          { 
            index: true,
             element: (
             <AuthGate>
                <FeedPage />
              </AuthGate>
            ),
          },
          { path: "plants",
            element: (
              <AuthGate>
                <PlantsPage />
              </AuthGate>
            ),
          },
          { path: "plants/:plantId", 
            element: (
              <AuthGate>
                <PlantProfilePage />
              </AuthGate>
            )
          },
          { path: "settings", 
            element: (
              <AuthGate>
                <SettingsPage />
              </AuthGate>
            )
          },
          {
            path: "tasks",
            element: (
              <AuthGate>
                <NotificationsPage />
              </AuthGate>
            ),
          },
          { path: "users/new", 
            element: (
              <AuthGate>
                <CreateUserPage />
              </AuthGate>
            )
          },
        ],
      },
      {
        element: <NoNavLayout />,
        children: [
          { path: "scan", 
            element: (
            <AuthGate>
              <ScanScreenWrapper />
            </AuthGate>
            ) },
          { path: "login", element: <LoginPage /> },
        ],
      },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
