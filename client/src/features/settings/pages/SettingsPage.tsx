import { Link } from "react-router-dom";
import LogoutLink from "../../users/pages/components/LogoutLink";
import PageHeader from "../../../ui/TopNav";

export default function SettingsPage() {
  return (
    <main className="app-root app-container mx-auto max-w-md bg-white text-gray-800 pb-16">
      {/* ✅ Use the shared PageHeader for consistency */}
      <PageHeader title="Settings" showBackButton={false} />

      <div className="p-4">
        <ul className="divide-y">
          <li className="py-3">
            <LogoutLink />
          </li>
          <li className="py-3">
            <Link to="/users/new" className="text-emerald-700">
              Add user
            </Link>
          </li>
          {/* <li className="py-3"><Link to="/pots/abc/edit" className="text-emerald-700">Edit pot (demo)</Link></li> */}
        </ul>
      </div>
    </main>
  );
}
