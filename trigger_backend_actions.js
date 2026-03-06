const fs = require("node:fs");
const path = require("node:path");

const businessId = "0b76ae1b-1ac6-49ff-ad85-4dff848b1e5b";
const backendUrl = "http://localhost:3001";
const heroFileName = "professional-eyebrow-artist-at-work.jpg";
const heroFilePath = path.join(
  "c:",
  "Users",
  "Lucas sá",
  "Documents",
  "agendamento_nota",
  "front_end",
  "src",
  "public",
  heroFileName,
);

async function performActions() {
  try {
    console.log("--- 1. Iniciando Upload de Banner (section: hero) ---");

    if (!fs.existsSync(heroFilePath)) {
      console.error("Arquivo não encontrado:", heroFilePath);
      return;
    }

    console.log("Utilizando Multipart manual...");
    const boundary = `----WebKitFormBoundary${Math.random()
      .toString(36)
      .substring(2)}`;
    const multipartLines = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="section"',
      "",
      "hero",
      `--${boundary}`,
      'Content-Disposition: form-data; name="businessId"',
      "",
      businessId,
      `--${boundary}`,
      `Content-Disposition: form-data; name="file"; filename="${heroFileName}"`,
      "Content-Type: image/jpeg",
      "",
    ];
    const header = `${multipartLines.join("\r\n")}\r\n`;
    const footer = `\r\n--${boundary}--\r\n`;
    const fileBuffer = fs.readFileSync(heroFilePath);
    const combinedBuffer = Buffer.concat([
      Buffer.from(header, "utf-8"),
      fileBuffer,
      Buffer.from(footer, "utf-8"),
    ]);

    const uploadResponse = await fetch(
      `${backendUrl}/api/settings/background-image`,
      {
        method: "POST",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
          "Content-Length": combinedBuffer.length,
        },
        body: combinedBuffer,
      },
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(
        `Upload falhou (${uploadResponse.status}): ${errorText}`,
      );
    }

    const uploadData = await uploadResponse.json();
    console.log("Upload concluído com sucesso:", uploadData);
    const imageUrl = uploadData.url;

    console.log("\n--- 2. Salvando Rascunho (PATCH draft) ---");
    const patchData = {
      hero: {
        title: "Beleza e Autoestima Elevadas ao Máximo",
        subtitle: "Sobrancelhas perfeitas para o seu olhar único.",
        bgType: "image",
        bgImage: imageUrl,
      },
    };

    const patchResponse = await fetch(
      `${backendUrl}/api/settings/draft/${businessId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patchData),
      },
    );

    if (!patchResponse.ok) {
      const errorText = await patchResponse.text();
      throw new Error(
        `Rascunho falhou (${patchResponse.status}): ${errorText}`,
      );
    }

    const draftData = await patchResponse.json();
    console.log("Rascunho salvo com sucesso:", draftData);

    console.log("\n--- 3. Publicando (POST publish) ---");
    const publishResponse = await fetch(
      `${backendUrl}/api/settings/publish/${businessId}`,
      {
        method: "POST",
      },
    );

    if (!publishResponse.ok) {
      const errorText = await publishResponse.text();
      throw new Error(
        `Publicação falhou (${publishResponse.status}): ${errorText}`,
      );
    }

    const publishData = await publishResponse.text();
    console.log("Publicação concluída com sucesso:", publishData);
    console.log("\n--- Todas as ações foram registradas no backend! ---");
  } catch (error) {
    console.error("Erro ao executar ações:", error.message);
  }
}

performActions();
