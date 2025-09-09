// src/features/users/components/LogoutLink.tsx
import { signOut } from "../../../../lib/auth-client";
import { useNavigate } from "react-router-dom";

export default function LogoutLink() {
  const navigate = useNavigate();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await signOut();       // clears session on server + cookie
    navigate("/login");    // redirect after logout
  };

  return (
    <a
      href="#"
      onClick={handleLogout}
      className="text-red-600 hover:underline"
    >
      Log out
    </a>
  );
}
