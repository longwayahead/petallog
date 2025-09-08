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
          { index: true, element: <FeedPage /> },
          { path: "plants", element: <PlantsPage /> },
          { path: "tasks", element: <NotificationsPage /> },
          { path: "settings", element: <SettingsPage /> },
          { path: "plants/:plantId", element: <PlantProfilePage /> },
        ],
      },
      {
        element: <NoNavLayout />,
        children: [
          { path: "scan", element: <ScanScreenWrapper /> },
        ],
      },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
