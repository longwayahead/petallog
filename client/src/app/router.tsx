import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import TabLayout from './layouts/TabLayout';
import NoNavLayout from './layouts/NoNavLayout';

// Pages that exist in your tree
import FeedPage from '../features/feed/pages/FeedPage';
import PlantsPage from '../features/search/pages/PlantsPage';
import NotificationsPage from '../features/tasks/pages/NotificationsPage';
import SettingsPage from '../features/settings/pages/SettingsPage';
import ScanPage from '../features/scanner/pages/ScanPage';
import SwipeablePanels from '../features/plants/pages/test'

// Plant profile detail
import PlantProfilePage from '../features/plants/pages/PlantProfilePage';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <TabLayout />, // shows BottomNav
        children: [
          { index: true, element: <FeedPage /> },
          { path: 'plants', element: <PlantsPage /> },
          { path: 'notifications', element: <NotificationsPage /> },
          { path: 'settings', element: <SettingsPage /> },

          // detail page with nav visible (you can move this to NoNav later if you prefer)
          { path: 'plants/:plantId', element: <PlantProfilePage /> },
        ],
      },

      // full-screen pages (no BottomNav)
      {
        element: <NoNavLayout />,
        children: [
          { path: 'scan', element: <ScanPage /> },
          { path: 'test', element: <SwipeablePanels /> },
        ],
      },

      // fallback
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
