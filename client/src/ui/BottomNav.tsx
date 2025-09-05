import { Link, NavLink } from "react-router-dom";
import { useTasks } from "../context/TaskContext";

export default function BottomNav() {
  const { pendingCount } = useTasks();
  const cls = (isActive: boolean) =>
    `p-2 ${isActive ? "text-emerald-600" : "text-gray-500"}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-gray-200 flex justify-around items-center z-30 max-w-md mx-auto">
      <NavLink to="/" end className={({ isActive }) => cls(isActive)}>
        <i className="fas fa-home text-xl" />
      </NavLink>

      <NavLink to="/plants" className={({ isActive }) => cls(isActive)}>
        <i className="fas fa-seedling text-xl" />
      </NavLink>

      <Link
        to="/scan"
        className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-full w-14 h-14 -mt-7 flex items-center justify-center shadow-md"
      >
        <i className="fas fa-camera text-xl" />
      </Link>

      <NavLink to="/notifications" className={({ isActive }) => cls(isActive)}>
        <span className="relative inline-flex">
          <i className="fa-solid fa-bell text-xl" />
          {pendingCount > 0 && (
            <span
              className="pointer-events-none absolute -top-2 -right-2
                          text-[10px] leading-none px-1.5 py-0.5 rounded-full
                          bg-red-600 text-white"
            >
              {pendingCount}
            </span>
          )}
        </span>
      </NavLink>

      <NavLink to="/settings" className={({ isActive }) => cls(isActive)}>
        <i className="fas fa-cog text-xl" />
      </NavLink>
    </div>
  );
}
