const fs = require("node:fs");
const path = require("node:path");

const filesToBundle = [
  "src/components/admin/site_editor/hooks/use-editor-state.ts",
  "src/components/admin/site_editor/hooks/use-editor-sync.ts",
  "src/components/admin/site_editor/pages/home/values-editor.tsx",
  "src/lib/site-customizer-service.ts",
  "src/lib/site-config-types.ts",
];

const outputPath = path.resolve(
  process.cwd(),
  "_notes",
  "preDocumentacao.txt",
  "gemniContext",
  "scripts",
  "gemini-context.md",
);

const resolveLanguage = (filePath) => {
  const ext = path.extname(filePath).replace(".", "");
  if (ext === "ts" || ext === "tsx") return ext;
  if (ext) return ext;
  return "text";
};

const sections = filesToBundle.map((filePath) => {
  const absolutePath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absolutePath)) {
    return `# ${filePath}\n\n\`\`\`text\nArquivo não encontrado: ${filePath}\n\`\`\`\n`;
  }
  const content = fs.readFileSync(absolutePath, "utf8");
  const language = resolveLanguage(filePath);
  return `# ${filePath}\n\n\`\`\`${language}\n${content}\n\`\`\`\n`;
});

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, sections.join("\n"), "utf8");
console.log(`Arquivo gerado: ${outputPath}`);
