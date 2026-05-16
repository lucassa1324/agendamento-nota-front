import { test, expect, Page } from "@playwright/test";

const API_BASE = "http://localhost:3000/api";
const OWNER_USER_ID = "owner-123";
const OTHER_STAFF_ID = "staff-456";

const mockSession = {
  user: {
    id: OWNER_USER_ID,
    name: "Dono da Conta",
    email: "dono@estudio.com",
    role: "admin",
    businessId: "biz-1",
  },
  session: { token: "fake-token" },
};

const mockStaffList = [
  {
    id: "staff-1",
    userId: OWNER_USER_ID,
    name: "Dono da Conta",
    email: "dono@estudio.com",
    isActive: true,
    isAdmin: true,
    isSecretary: false,
    isProfessional: true,
    calendarColor: "#2563EB",
    commissionRate: 0,
    serviceIds: [],
  },
  {
    id: OTHER_STAFF_ID,
    userId: "other-user",
    name: "Outro Colaborador",
    email: "outro@estudio.com",
    isActive: true,
    isAdmin: false,
    isSecretary: false,
    isProfessional: true,
    calendarColor: "#DC2626",
    commissionRate: 10,
    serviceIds: ["svc-1"],
  },
];

const mockServices = [{ id: "svc-1", name: "Design de Sobrancelhas" }];

const mockBusiness = { financialPassword: "****" };

async function setupMocks(page: Page) {
  // Intercepta chamadas da better-auth (session)
  await page.route("**/api/auth/**", async (route) => {
    const url = route.request().url();
    if (url.includes("get-session") || url.includes("session")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockSession) });
    } else {
      await route.continue();
    }
  });

  // Intercepta chamadas do staff
  await page.route(`${API_BASE}/staff/company/*`, async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockStaffList) });
  });

  // Intercepta chamadas de serviços
  await page.route(`${API_BASE}/services/company/*`, async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockServices) });
  });

  // Intercepta chamadas de business
  await page.route(`${API_BASE}/business/*`, async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockBusiness) });
  });
}

test.describe("Restrição de segurança do proprietário na gestão de colaboradores", () => {
  test("deve desabilitar os switches Administrador e Membro ativo para o perfil do dono", async ({ page }) => {
    await setupMocks(page);

    // Navega para a página de time
    await page.goto("/admin/meu-estudio/dashboard/time");

    // Aguarda o carregamento dos dados
    await page.waitForSelector("text=Dono da Conta");

    // Clica no próprio perfil (dono)
    await page.click("text=Dono da Conta");

    // Verifica se o aviso de proprietário aparece
    await expect(page.locator('[role="alert"]')).toBeVisible();
    await expect(page.locator('[role="alert"]')).toContainText("proprietário da conta");

    // Verifica se o switch Administrador está desabilitado
    const adminLabel = page.locator('label:has-text("Administrador")').first();
    const adminSwitch = adminLabel.locator('[role="switch"]');
    await expect(adminSwitch).toBeDisabled();

    // Verifica se o switch Membro ativo está desabilitado
    const activeLabel = page.locator('label:has-text("Membro ativo")').first();
    const activeSwitch = activeLabel.locator('[role="switch"]');
    await expect(activeSwitch).toBeDisabled();
  });

  test("deve manter os switches habilitados para outros colaboradores", async ({ page }) => {
    await setupMocks(page);

    await page.goto("/admin/meu-estudio/dashboard/time");
    await page.waitForSelector("text=Outro Colaborador");

    // Clica no perfil de outro colaborador
    await page.click("text=Outro Colaborador");

    // Verifica que NÃO há aviso de proprietário
    await expect(page.locator('[role="alert"]')).not.toBeVisible();

    // Verifica se o switch Administrador está habilitado
    const adminLabel = page.locator('label:has-text("Administrador")').first();
    const adminSwitch = adminLabel.locator('[role="switch"]');
    await expect(adminSwitch).toBeEnabled();

    // Verifica se o switch Membro ativo está habilitado
    const activeLabel = page.locator('label:has-text("Membro ativo")').first();
    const activeSwitch = activeLabel.locator('[role="switch"]');
    await expect(activeSwitch).toBeEnabled();
  });

  test("deve exibir atributos de acessibilidade nos switches desabilitados", async ({ page }) => {
    await setupMocks(page);

    await page.goto("/admin/meu-estudio/dashboard/time");
    await page.waitForSelector("text=Dono da Conta");
    await page.click("text=Dono da Conta");

    // Verifica aria-disabled nos labels
    const adminLabel = page.locator('label:has-text("Administrador")').first();
    await expect(adminLabel).toHaveAttribute("aria-disabled", "true");

    // Verifica aria-label descritivo nos switches
    const adminSwitch = adminLabel.locator('[role="switch"]');
    await expect(adminSwitch).toHaveAttribute(
      "aria-label",
      "Permissão de administrador bloqueada para o próprio dono",
    );
  });
});
