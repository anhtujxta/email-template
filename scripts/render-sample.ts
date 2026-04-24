import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderQuoteTemplate } from "../src/render.ts";

const root = process.cwd();
const payloadPath = resolve(root, "sample-payload.json");
const outputDir = resolve(root, "dist");
const outputPath = resolve(outputDir, "sample-preview.html");

const payload = JSON.parse(readFileSync(payloadPath, "utf8"));
const html = renderQuoteTemplate(payload);

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, html, "utf8");

console.log(`Rendered sample HTML to ${outputPath}`);
