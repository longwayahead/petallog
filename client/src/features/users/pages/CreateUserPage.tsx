import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../ui/TopNav";
import { signUp } from "../../../lib/auth-client";

export default function CreateUserPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Better-Auth: email/password signup
      const result = await signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      // success → redirect to settings
      navigate("/settings");
    } catch (err) {
      console.error(err);
      alert("Error creating user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-root app-container mx-auto max-w-md bg-white text-gray-800">
      <PageHeader title="Create User" showBackButton />

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create User"}
        </button>
      </form>
    </main>
  );
}
