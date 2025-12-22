// Sistema de autenticação para o dashboard administrativo

export interface AdminUser {
  username: string;
  password: string;
  name: string;
}

const ADMIN_USERS: AdminUser[] = [
  {
    username: "admin",
    password: "admin123",
    name: "Administrador",
  },
];

export function checkAdminAuth(): boolean {
  if (typeof window === "undefined") return false;
  const token = sessionStorage.getItem("adminToken");
  return token !== null;
}

export function loginAdmin(username: string, password: string): boolean {
  const user = ADMIN_USERS.find(
    (u) => u.username === username && u.password === password,
  );

  if (user) {
    const token = btoa(
      JSON.stringify({
        username: user.username,
        name: user.name,
        timestamp: Date.now(),
      }),
    );
    sessionStorage.setItem("adminToken", token);
    sessionStorage.setItem(
      "adminUser",
      JSON.stringify({ username: user.username, name: user.name }),
    );
    return true;
  }
  return false;
}

export function getAdminUser(): { username: string; name: string } | null {
  if (typeof window === "undefined") return null;
  const userStr = sessionStorage.getItem("adminUser");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function logoutAdmin(): void {
  sessionStorage.removeItem("adminToken");
  sessionStorage.removeItem("adminUser");
}
