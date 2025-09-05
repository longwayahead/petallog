import { Outlet } from 'react-router-dom';
import BottomNav from '../../ui/BottomNav';

export default function TabLayout() {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  );
}
