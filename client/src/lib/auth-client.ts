import { createAuthClient } from "better-auth/react";

let _client: ReturnType<typeof createAuthClient> | null = null;

export function getAuthClient() {
  if (!_client) {
    _client = createAuthClient({
      baseURL: import.meta.env.VITE_API_URL + "/api/auth",
      fetchOptions: {
        credentials: "include",
      },
    });
  }
  return _client;
}

export const { useSession, signIn, signUp, signOut } = getAuthClient();
