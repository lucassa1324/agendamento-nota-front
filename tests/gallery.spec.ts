import { expect, test } from "@playwright/test";

test.describe("Editor de Site - Galeria", () => {
  test.describe.configure({ mode: "serial", timeout: 120000 });

  test.beforeEach(async ({ page }) => {
    // 0. Aumenta o viewport para evitar sobreposições
    await page.setViewportSize({ width: 1920, height: 1080 });

    // 1. Login
    await page.goto("/admin");
    await page.getByPlaceholder(/email/i).fill("atrossilva2019@gmail.com");
    await page.getByPlaceholder(/senha/i).fill("123123123");

    // Captura logs do console para depuração
    page.on('console', msg => console.log(`BROWSER_LOG: ${msg.text()}`));

    const loginButton = page.getByRole("button", { name: /entrar/i });
    await loginButton.click();

    // 2. Navegação para Personalização
    try {
      await page.waitForURL(
        (url) =>
          /\/admin\/.*\/dashboard/.test(url.toString()) ||
          /\/admin\/pending-verification/.test(url.toString()) ||
          /\/admin\/master/.test(url.toString()),
        { timeout: 30000 },
      );
    } catch (e) {
      const currentUrl = page.url();
      const errorText = await page
        .locator(".text-destructive, .text-red-500")
        .textContent()
        .catch(() => "Nenhum erro visível");
      const errorMessage = e instanceof Error ? e.message : String(e);
      throw new Error(
        `Timeout no login. URL atual: ${currentUrl}. Erro na tela: ${errorText}. Original: ${errorMessage}`,
      );
    }

    if (/\/admin\/pending-verification/.test(page.url())) {
      throw new Error("Usuário de teste sem e-mail verificado.");
    }

    if (/\/admin\/master/.test(page.url())) {
      throw new Error("Usuário de teste é SUPER_ADMIN, o teste espera um ADMIN de estúdio.");
    }

    const studioSlug = page.url().match(/\/admin\/(.*)\/dashboard/)?.[1];
    if (!studioSlug) {
      throw new Error(`Não foi possível extrair o slug do estúdio da URL: ${page.url()}`);
    }
    await page.goto(`/admin/${studioSlug}/dashboard/personalizacao`);

    // 3. Força desativação do tour e espera carregar
    await page.evaluate(() =>
      localStorage.setItem("tour_customizer_v1", "true"),
    );
    await expect(page.locator('iframe[title="Preview"]')).toBeVisible({
      timeout: 30000,
    });
    await expect(page.getByText("Verificando acesso...")).not.toBeVisible({
      timeout: 15000,
    });
  });

  test("deve seguir o fluxo completo de alteração de cor da galeria e salvar", async ({
    page,
  }) => {
    await page.addStyleTag({
      content:
        "*,*::before,*::after{transition-duration:0s!important;transition-delay:0s!important;animation-duration:0s!important;animation-delay:0s!important;}",
    });

    const openGridFotos = async () => {
      const toolsButton = page.locator(
        'button[data-tour="customizer-tools-button"]',
      );
      const editorHeader = page.getByText(/editor/i).first();

      if (
        !(await editorHeader.isVisible()) &&
        (await toolsButton.isVisible())
      ) {
        await toolsButton.click({ force: true });
        await expect(editorHeader).toBeVisible({ timeout: 5000 });
      }

      const sidebar = page.locator('[data-tour="customizer-tools-sidebar"]');
      const sidebarClass = (await sidebar.getAttribute("class")) || "";
      if (sidebarClass.includes("w-0") && (await toolsButton.isVisible())) {
        await toolsButton.click({ force: true });
      }
      await expect(sidebar).toHaveClass(/w-(64|80)/);

      const galeriaButton =
        (await sidebar
          .getByRole("button", { name: "Galeria", exact: true })
          .count()) > 0
          ? sidebar
            .getByRole("button", { name: "Galeria", exact: true })
            .first()
          : sidebar
            .locator('div[role="button"]')
            .filter({ hasText: /^Galeria/i })
            .first();

      await expect(galeriaButton).toBeVisible({ timeout: 15000 });
      await galeriaButton.click({ force: true });

      const gridFotosSection = sidebar
        .getByRole("button", { name: /Grid de Fotos/i })
        .first();
      await expect(gridFotosSection).toBeVisible({ timeout: 15000 });
      await gridFotosSection.click({ force: true });
    };

    await openGridFotos();

    const accordionTrigger = page.getByRole("button", {
      name: /FUNDO DA SEÇÃO/i,
    });
    await expect(accordionTrigger).toBeVisible({ timeout: 10000 });
    await accordionTrigger.click({ force: true });

    const backgroundFieldset = page
      .locator("fieldset")
      .filter({ hasText: /Cor de Fundo/i })
      .first();
    const colorInput = backgroundFieldset
      .locator('input[type="color"]')
      .first();
    await expect(colorInput).toBeVisible({ timeout: 5000 });
    await colorInput.fill("#f0a8a8");

    // 4. Verifica no iframe se a cor mudou (Live Preview)
    const iframe = page.frameLocator('iframe[title="Preview"]');
    const homeGallerySection = iframe.locator("section#home-gallery");
    const pageGallerySection = iframe.locator("#gallery-grid");
    const gallerySection =
      (await homeGallerySection.count()) > 0
        ? homeGallerySection.first()
        : pageGallerySection.first();
    await expect(gallerySection).toBeVisible({ timeout: 10000 });
    await expect(gallerySection).toHaveCSS(
      "background-color",
      "rgb(240, 168, 168)",
      { timeout: 10000 },
    );

    const saveButton = page.getByRole("button", { name: /Salvar Alterações/i });
    await expect(saveButton).toBeVisible({ timeout: 5000 });
    await saveButton.click({ force: true });

    // 5. Espera um pouco para garantir que não houve reset após o save
    await page.waitForTimeout(3000);
    await expect(gallerySection).toHaveCSS(
      "background-color",
      "rgb(240, 168, 168)",
      { timeout: 10000 },
    );

    const persistedColorInput = backgroundFieldset
      .locator('input[type="color"]')
      .first();
    await expect(persistedColorInput).toHaveValue("#f0a8a8");
  });
});
