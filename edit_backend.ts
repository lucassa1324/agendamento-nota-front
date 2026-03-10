import fs from 'node:fs';
import path from 'node:path';

const BACKEND_DIR = 'c:/Users/Lucas sá/Documents/agendamento_nota/back_end';

function log(msg: string) {
    console.log(`[EDIT_BACKEND] ${msg}`);
}

// 1. Validation of Connection in database.ts
const dbPath = path.join(BACKEND_DIR, 'src/modules/infrastructure/drizzle/database.ts');
if (fs.existsSync(dbPath)) {
    let content = fs.readFileSync(dbPath, 'utf-8');
    if (!content.includes('[DB] Conectado ao PostgreSQL Local')) {
        content = content.replace(
            'const dbUrl = process.env.DATABASE_URL || "";',
            'const dbUrl = process.env.DATABASE_URL || "";\n\nif (dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1")) {\n    console.log(">>> [DB] Conectado ao PostgreSQL Local (Docker) na porta 5432");\n}'
        );
        fs.writeFileSync(dbPath, content);
        log('Updated database.ts with connection log.');
    }
}

// 2. Adjustment in Better Auth (auth-plugin.ts)
const authPluginPath = path.join(BACKEND_DIR, 'src/modules/infrastructure/auth/auth-plugin.ts');
if (fs.existsSync(authPluginPath)) {
    let content = fs.readFileSync(authPluginPath, 'utf-8');
    if (!content.includes('[AUTH_CLEANUP]')) {
        // Find the getSession call
        const getSessionPattern = /const authSession = await auth\.api\.getSession\(\{[\s\S]*?\}\);/;
        const replacement = `const authSession = await auth.api.getSession({
                headers: headers,
            });

            if (!authSession && cookieHeader && cookieHeader.includes("better-auth.session_token")) {
                console.log(">>> [AUTH_CLEANUP] Sessão inválida/antiga detectada no banco novo. Limpando cookies...");
                set.headers["Set-Cookie"] = "better-auth.session_token=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax";
            }`;
        
        content = content.replace(getSessionPattern, replacement);
        fs.writeFileSync(authPluginPath, content);
        log('Updated auth-plugin.ts to handle invalid sessions.');
    }
}

// 3. Health Check Route in index.ts
const indexPath = path.join(BACKEND_DIR, 'src/index.ts');
if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf-8');
    if (!content.includes('select 1')) {
        const healthPattern = /\.get\("\/api\/health", \(\) => \{[\s\S]*?\}\)/;
        const replacement = `.get("/api/health", async () => {
        try {
          const { db } = require("./modules/infrastructure/drizzle/database");
          const { sql } = require("drizzle-orm");
          await db.execute(sql\`select 1\`);
          console.log("[HEALTH_CHECK] Hitting health endpoint - SUCCESS (DB Connected)");
          return { 
            status: "ok", 
            database: "connected",
            timestamp: new Date().toISOString(), 
            version: "V2-LOCAL-DOCKER" 
          };
        } catch (e) {
          console.error("[HEALTH_CHECK] DB Connection failed:", e);
          return { 
            status: "error", 
            database: "disconnected",
            error: String(e),
            timestamp: new Date().toISOString() 
          };
        }
      })`;
        content = content.replace(healthPattern, replacement);
        fs.writeFileSync(indexPath, content);
        log('Updated index.ts with enhanced health check.');
    }
}

// 4. Default JSON for appointmentFlow in settings.drizzle.repository.ts
const repositoryPath = path.join(BACKEND_DIR, 'src/modules/settings/adapters/out/drizzle/settings.drizzle.repository.ts');
if (fs.existsSync(repositoryPath)) {
    let content = fs.readFileSync(repositoryPath, 'utf-8');
    
    // Add import if not present
    if (!content.includes('DEFAULT_APPOINTMENT_FLOW_SECTION')) {
        const importPattern = /import \{ SiteCustomization \} from ".*";/;
        const replacement = `import { SiteCustomization } from "../../../../../modules/business/domain/types/site_customization.types";
import { 
  DEFAULT_LAYOUT_GLOBAL, 
  DEFAULT_HOME_SECTION, 
  DEFAULT_GALLERY_SECTION, 
  DEFAULT_ABOUT_US_SECTION, 
  DEFAULT_APPOINTMENT_FLOW_SECTION 
} from "../../../../../modules/business/domain/constants/site_customization.defaults";`;
        
        content = content.replace(importPattern, replacement);
    }

    // Replace return null with default object
    if (content.includes('if (!result) return null;')) {
        const returnReplacement = `if (!result) {
        return {
          layoutGlobal: DEFAULT_LAYOUT_GLOBAL,
          home: DEFAULT_HOME_SECTION,
          gallery: DEFAULT_GALLERY_SECTION,
          aboutUs: DEFAULT_ABOUT_US_SECTION,
          appointmentFlow: DEFAULT_APPOINTMENT_FLOW_SECTION,
        } as SiteCustomization;
      }`;
        content = content.replace('if (!result) return null;', returnReplacement);
        fs.writeFileSync(repositoryPath, content);
        log('Updated settings.drizzle.repository.ts with default customization fallback.');
    }
}
