import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve, relative, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import type { IncomingMessage, ServerResponse } from "node:http";
import { strictYaml } from "./shared/tools/generate-catalog.mjs";
import Ajv2020 from "ajv/dist/2020";
import schema from "./settings/web.schema.json" with { type: "json" };

const config = strictYaml(readFileSync(new URL("./settings/web.yml", import.meta.url), "utf8"));
const bounds = strictYaml(readFileSync(new URL("./shared/settings/publication-policy.yml", import.meta.url), "utf8"));
const validate = new Ajv2020({ strict: true }).compile<Omit<WebConfig, "defaultUiLanguage" | "defaultTheme" | "uiLanguages" | "uiThemes" | "maxFavorites">>(schema);
if (!validate(config)) throw new Error("Invalid web settings: " + JSON.stringify(validate.errors));
const defaults = strictYaml(readFileSync(new URL("./shared/settings/defaults.yml", import.meta.url), "utf8"));
if (!defaults || typeof defaults !== "object" || !("uiLanguage" in defaults) ||
    !["en", "kn"].includes(String(defaults.uiLanguage)) || !("theme" in defaults) ||
    !["light", "dark"].includes(String(defaults.theme)) || !("supportedUiLanguages" in defaults) ||
    !Array.isArray(defaults.supportedUiLanguages) || defaults.supportedUiLanguages.some(language => !["en", "kn"].includes(language)) ||
    !defaults.supportedUiLanguages.includes(defaults.uiLanguage) || !("supportedThemes" in defaults) ||
    !Array.isArray(defaults.supportedThemes) || defaults.supportedThemes.some(theme => !["light", "dark"].includes(theme)) ||
    !defaults.supportedThemes.includes(defaults.theme)) throw new Error("Invalid portable defaults");
const personal = strictYaml(readFileSync(new URL("./shared/settings/personal-transfer.yml", import.meta.url), "utf8"));
if (!personal || typeof personal !== "object" || !("maxFavorites" in personal) ||
    typeof personal.maxFavorites !== "number" || !Number.isSafeInteger(personal.maxFavorites) || personal.maxFavorites <= 0) throw new Error("Invalid portable personal limits");
if (!bounds || typeof bounds !== "object" || !("supportedRequiredCapabilities" in bounds) ||
  !Array.isArray(bounds.supportedRequiredCapabilities) || bounds.supportedRequiredCapabilities.some(value => typeof value !== "string") ||
  Object.entries(bounds).some(([key, value]) =>
  key !== "supportedRequiredCapabilities" && (!Number.isSafeInteger(value) || Number(value) <= 0))) throw new Error("Invalid publication safety settings");
const fixturePrefix = new URL(".", new URL(config.descriptorUrl, "http://localhost")).pathname;
const descriptorPath = new URL(config.descriptorUrl, "http://localhost").pathname;
const fixtureDirectory = fileURLToPath(new URL("public" + fixturePrefix, import.meta.url));
function fixtureArtifacts(directory: string) {
  return (request: IncomingMessage, response: ServerResponse, next: (error?: unknown) => void) => {
    const path = new URL(request.url ?? "/", "http://localhost").pathname;
    if (path !== descriptorPath && (!path.startsWith(fixturePrefix) ||
        !/^objects\/[0-9a-f]{64}\.json\.gz$/.test(path.slice(fixturePrefix.length)))) return next();
    readFile(resolve(directory, path.slice(1))).then(bytes => {
      response.setHeader("Content-Type", path === descriptorPath ? "application/json" : "application/octet-stream");
      if (path === descriptorPath) response.setHeader("Cache-Control", "no-store");
      response.setHeader("Content-Encoding", "identity");
      response.setHeader("Content-Length", bytes.length);
      response.end(bytes);
    }).catch(next);
  };
}
export default defineConfig({
  plugins: [react(), {
    name: "encoded-fixture-artifacts",
    configureServer(server) {
      server.middlewares.use(fixtureArtifacts(resolve(server.config.root, "public")));
    },
    configurePreviewServer(server) {
      server.middlewares.use(fixtureArtifacts(resolve(server.config.root, server.config.build.outDir)));
    },
  }], base: config.base,
  server: { port: config.demoPort, watch: { ignored: path => {
    // Publishing immutable fixtures must not silently reload an active reader.
    const within = relative(fixtureDirectory, path);
    return within === "" || (!within.startsWith("..") && !isAbsolute(within));
  } } },
  define: { __WEB_CONFIG__: JSON.stringify({ ...config, defaultUiLanguage: defaults.uiLanguage,
    defaultTheme: defaults.theme, uiLanguages: defaults.supportedUiLanguages, uiThemes: defaults.supportedThemes,
    maxFavorites: personal.maxFavorites }), __BOUNDS__: JSON.stringify(bounds) },
  test: { include: ["src/**/*.test.ts"], environment: "node" },
});
