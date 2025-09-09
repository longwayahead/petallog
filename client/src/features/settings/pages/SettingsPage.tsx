import { Link } from 'react-router-dom';
import LogoutLink from '../../users/pages/components/LogoutLink';

export default function SettingsPage() {
  return (
    <main className="app-root app-container mx-auto max-w-md bg-white text-gray-800 pb-16">
      <header className="sticky top-0 z-10 bg-white border-b px-4 h-[56px] flex items-center">
        <h1 className="text-lg font-semibold">Settings</h1>
      </header>
      <div className="p-4">
        <ul className="divide-y">
          <li className="py-3"><LogoutLink /></li>
          <li className="py-3"><Link to="/users/new" className="text-emerald-700">Add user</Link></li>
          {/* <li className="py-3"><Link to="/pots/abc/edit" className="text-emerald-700">Edit pot (demo)</Link></li> */}
        </ul>
        
      </div>
    </main>
  );
}
