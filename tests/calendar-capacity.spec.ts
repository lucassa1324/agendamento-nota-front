import { expect, test, type Page } from "@playwright/test";

test.describe("Capacidade do calendario publico", () => {
  test.describe.configure({ mode: "serial", timeout: 180000 });

  const bookingUrl = "http://aura-teste.localhost:3000/agendamento";
  const serviceNameRegex = /Atendimento Padr/i;

  async function selectService(page: Page) {
    await expect(page.getByRole("heading", { name: /Escolha seus Servi/i })).toBeVisible({
      timeout: 30000,
    });

    const serviceTitle = page.locator("h3").filter({ hasText: serviceNameRegex }).first();
    await expect(serviceTitle).toBeVisible({ timeout: 15000 });
    await serviceTitle.click();

    await page.getByRole("button", { name: /Confirmar Selec/i }).click();
  }

  async function selectDate(page: Page, dayText?: string) {
    await expect(page.getByText(/Escolha a Data/i)).toBeVisible({ timeout: 15000 });

    if (dayText) {
      const sameDay = page.locator(`button.aspect-square:has-text("${dayText}")`).first();
      await expect(sameDay).toBeVisible({ timeout: 15000 });
      await expect(sameDay).toBeEnabled();
      await sameDay.click();
      return dayText;
    }

    const firstAvailableDay = page.locator("button.aspect-square:not([disabled])").first();
    await expect(firstAvailableDay).toBeVisible({ timeout: 15000 });

    const pickedDay = (await firstAvailableDay.innerText()).trim();
    await firstAvailableDay.click();
    return pickedDay;
  }

  async function findFirstEnabledSlot(page: Page) {
    await expect(page.getByText(/Escolha o Hor.rio/i)).toBeVisible({ timeout: 15000 });

    const slotButtons = page.locator("button.h-16");
    const count = await slotButtons.count();

    for (let i = 0; i < count; i += 1) {
      const button = slotButtons.nth(i);
      if (!(await button.isEnabled())) continue;
      const text = (await button.innerText()).trim();
      const match = text.match(/\b\d{2}:\d{2}\b/);
      if (match) {
        return { time: match[0], button };
      }
    }

    return null;
  }

  async function goToFormWithSlot(page: Page, dayText?: string, desiredTime?: string) {
    await selectService(page);
    const selectedDay = await selectDate(page, dayText);

    if (desiredTime) {
      await expect(page.getByText(/Escolha o Hor.rio/i)).toBeVisible({ timeout: 15000 });
      const desiredSlot = page.locator(`button.h-16:has-text("${desiredTime}")`).first();
      if ((await desiredSlot.count()) === 0) {
        return { selectedDay, selectedTime: desiredTime, available: false };
      }

      if (!(await desiredSlot.isEnabled())) {
        return { selectedDay, selectedTime: desiredTime, available: false };
      }

      await desiredSlot.click();
      return { selectedDay, selectedTime: desiredTime, available: true };
    }

    const firstSlot = await findFirstEnabledSlot(page);
    expect(firstSlot).not.toBeNull();
    if (!firstSlot) {
      return { selectedDay, selectedTime: "", available: false };
    }

    await firstSlot.button.click();

    return { selectedDay, selectedTime: firstSlot.time, available: true };
  }

  async function finishBooking(page: Page, suffix: string) {
    await expect(page.getByText(/Seus Dados/i)).toBeVisible({ timeout: 15000 });

    const unique = Date.now();
    await page.locator("#name").fill(`Teste Capacidade ${suffix}`);
    await page.locator("#email").fill(`capacidade.${suffix}.${unique}@example.com`);
    await page.locator("#phone").fill(`(11) 9${String(unique).slice(-8)}`);

    await page.getByRole("button", { name: /Finalizar Agendamento/i }).click();

    await expect(page.getByText(/Agendamento (Confirmado|Atualizado)!/i)).toBeVisible({ timeout: 30000 });
  }

  test("deve permitir 2 agendamentos no mesmo horario e bloquear o terceiro", async ({ page }) => {
    await page.goto(bookingUrl, { waitUntil: "domcontentloaded" });

    const first = await goToFormWithSlot(page);
    expect(first.available).toBeTruthy();
    expect(first.selectedTime).toMatch(/^\d{2}:\d{2}$/);
    await finishBooking(page, "01");

    await page.getByRole("button", { name: /Fazer outro agendamento/i }).click();

    const second = await goToFormWithSlot(page, first.selectedDay, first.selectedTime);
    expect(second.available).toBeTruthy();
    await finishBooking(page, "02");

    await page.getByRole("button", { name: /Fazer outro agendamento/i }).click();

    const third = await goToFormWithSlot(page, first.selectedDay, first.selectedTime);
    expect(third.available).toBeFalsy();
  });
});
