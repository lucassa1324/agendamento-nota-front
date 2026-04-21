import { test, expect } from '@playwright/test';

test.describe('Editor de Site - Bot de Validação de UI', () => {
  test.describe.configure({ mode: 'serial', timeout: 120000 });

  test.beforeEach(async ({ page }) => {
    // 1. Vai para a página de login
    await page.goto('/admin');

    // 2. Preenche os campos de login
    await page.getByPlaceholder(/email/i).fill('atrossilva2019@gmail.com');
    await page.getByPlaceholder(/senha/i).fill('123123123');

    // 3. Clica no botão de entrar e aguarda a navegação
    await Promise.all([
      page.waitForURL(/\/admin\/.*\/dashboard(\/overview)?/, { timeout: 90000, waitUntil: 'commit' }),
      page.getByRole('button', { name: /entrar/i }).click()
    ]);

    // 4. Pega a URL atual para descobrir o slug do estúdio
    const currentUrl = page.url();
    const studioSlugMatch = currentUrl.match(/\/admin\/(.*)\/dashboard/);

    if (studioSlugMatch && studioSlugMatch[1]) {
      const studioSlug = studioSlugMatch[1];
      console.log(`✅ Studio detectado: ${studioSlug}`);
      await page.goto(`/admin/${studioSlug}/dashboard/personalizacao`);
    } else {
      await page.goto('/admin/dashboard/personalizacao');
    }

    // 5. Desativa o tour
    await page.evaluate(() => {
      localStorage.setItem('tour_customizer_v1', 'true');
    });

    // 6. Aguarda o carregamento inicial do editor
    // Primeiro, esperamos que a tela de "Verificando acesso..." desapareça
    await expect(page.getByText('Verificando acesso...')).not.toBeVisible({ timeout: 15000 });

    // Aumentamos o timeout e garantimos que o iframe está pronto
    await expect(page.locator('iframe[title="Preview"]')).toBeVisible({ timeout: 30000 });

    // 7. Garante que o painel de Ferramentas está aberto
    const toolsButton = page.getByRole('button', { name: /Ferramentas/i });
    if (await toolsButton.isVisible()) {
      await toolsButton.click();
    }

    // Pequena pausa para garantir que o JS do editor carregou os botões da sidebar
    await page.waitForTimeout(2000);
  });

  test('deve alterar a cor de fundo dos cards de serviços e refletir no preview', async ({ page }) => {
    // Usamos force: true porque o preview as vezes sobrepõe visualmente a sidebar no Playwright
    // Selecionamos especificamente a seção "Nossos Serviços"
    const servicesButton = page.locator('div[role="button"]').filter({ hasText: /^Nossos Serviços$/ });
    await servicesButton.click({ force: true });

    // Aguarda o editor de serviços carregar
    const cardsAccordion = page.getByText('ESTILO DOS CARDS');
    await expect(cardsAccordion).toBeVisible({ timeout: 10000 });
    await cardsAccordion.click({ force: true });

    const cardBgInput = page.locator('fieldset:has-text("Fundo do Card") input[type="color"]');
    await expect(cardBgInput).toBeVisible({ timeout: 5000 });
    const testColor = '#ff00ff';
    await cardBgInput.fill(testColor);

    await expect(cardBgInput).toHaveValue(testColor);

    const previewFrame = page.frameLocator('iframe[title="Preview"]');
    await page.waitForTimeout(2000);

    const serviceCard = previewFrame.locator('[data-slot="card"]').first();
    await expect(serviceCard).toHaveCSS('background-color', 'rgb(255, 0, 255)');
  });

  test('deve alterar a cor dos ícones dos cards', async ({ page }) => {
    await page.locator('div[role="button"]').filter({ hasText: /^Nossos Serviços$/ }).click({ force: true });
    const cardsAccordion = page.getByText('ESTILO DOS CARDS');
    await expect(cardsAccordion).toBeVisible({ timeout: 10000 });
    await cardsAccordion.click({ force: true });

    const iconColorInput = page.locator('fieldset:has-text("Cor dos Ícones") input[type="color"]');
    await expect(iconColorInput).toBeVisible({ timeout: 5000 });
    const testColor = '#0000ff';
    await iconColorInput.fill(testColor);

    const previewFrame = page.frameLocator('iframe[title="Preview"]');
    await page.waitForTimeout(2000);

    const icon = previewFrame.locator('[data-slot="card"] svg').first();
    await expect(icon).toHaveCSS('color', 'rgb(0, 0, 255)');
  });

  test('deve garantir que o botão "Salvar" persiste as alterações', async ({ page }) => {
    await page.locator('div[role="button"]').filter({ hasText: /^Nossos Serviços$/ }).click({ force: true });
    const cardsAccordion = page.getByText('ESTILO DOS CARDS');
    await expect(cardsAccordion).toBeVisible({ timeout: 10000 });
    await cardsAccordion.click({ force: true });

    const cardBgInput = page.locator('fieldset:has-text("Fundo do Card") input[type="color"]');
    await expect(cardBgInput).toBeVisible({ timeout: 5000 });
    const persistentColor = '#123456';
    await cardBgInput.fill(persistentColor);

    const saveButton = page.getByRole('button', { name: /salvar/i }).first();
    await saveButton.click({ force: true });

    // Aguarda o salvamento (feedback visual ou tempo)
    await page.waitForTimeout(3000);

    await page.reload();
    await expect(page.locator('iframe[title="Preview"]')).toBeVisible({ timeout: 30000 });

    await page.locator('div[role="button"]').filter({ hasText: /^Nossos Serviços$/ }).click({ force: true });
    const cardsAccordionReloaded = page.getByText('ESTILO DOS CARDS');
    await expect(cardsAccordionReloaded).toBeVisible({ timeout: 10000 });
    await cardsAccordionReloaded.click({ force: true });
    await expect(cardBgInput).toHaveValue(persistentColor);
  });
});
