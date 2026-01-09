
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface User {
  id: string;
  email: string;
  name?: string;
  emailVerified: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  userId: string;
}

export interface AuthResponse {
  user: User;
  session: Session;
}

export async function loginWithEmail(email: string, password: string): Promise<AuthResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/sign-in/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        callbackURL: "/", // Optional, but good to include
      }),
      credentials: "include", // Critical for cookies
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Login failed:", errorData);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
}

export async function getSession(): Promise<AuthResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/get-session`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data; // Usually returns { user, session } or null
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
}

export async function logout(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/sign-out`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response.ok;
  } catch (error) {
    console.error("Logout error:", error);
    return false;
  }
}
