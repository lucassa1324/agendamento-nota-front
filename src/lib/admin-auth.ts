// Sistema de autenticação para o dashboard administrativo

export interface AdminUser {
  username: string;
  password: string;
  name: string;
  email?: string;
  phone?: string;
}

const DEFAULT_ADMIN: AdminUser = {
  username: "admin",
  password: "admin123",
  name: "Administrador",
};

export function getStoredAdminUser(): AdminUser {
  if (typeof window === "undefined") return DEFAULT_ADMIN;
  const stored = localStorage.getItem("adminProfile");
  if (!stored) return DEFAULT_ADMIN;
  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_ADMIN;
  }
}

export function saveAdminProfile(profile: AdminUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("adminProfile", JSON.stringify(profile));

  // Atualizar também o usuário logado no sessionStorage se for o mesmo
  const currentUser = getAdminUser();
  if (currentUser && currentUser.username === profile.username) {
    sessionStorage.setItem(
      "adminUser",
      JSON.stringify({ username: profile.username, name: profile.name }),
    );
  }
}

export function checkAdminAuth(): boolean {
  if (typeof window === "undefined") return false;
  const token = sessionStorage.getItem("adminToken");
  return token !== null;
}

export function loginAdmin(username: string, password: string): boolean {
  const adminProfile = getStoredAdminUser();

  if (
    adminProfile.username === username &&
    adminProfile.password === password
  ) {
    const token = btoa(
      JSON.stringify({
        username: adminProfile.username,
        name: adminProfile.name,
        timestamp: Date.now(),
      }),
    );
    sessionStorage.setItem("adminToken", token);
    sessionStorage.setItem(
      "adminUser",
      JSON.stringify({
        username: adminProfile.username,
        name: adminProfile.name,
      }),
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
