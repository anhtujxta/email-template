import puppeteer, { type BrowserWorker } from "@cloudflare/puppeteer";
import { renderQuoteTemplate, SAMPLE_PAYLOAD, type QuoteTemplatePayload } from "./render.ts";

interface Env {
  BROWSER: BrowserWorker;
}

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "content-type"
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      if (request.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
      }

      const url = new URL(request.url);

      if (request.method === "GET" && url.pathname === "/") {
        return jsonResponse({
          name: "jixta-quote-pdf",
          endpoints: {
            html: "POST /html",
            pdf: "POST /pdf",
            sample: "GET /sample"
          }
        });
      }

      if (request.method === "GET" && url.pathname === "/sample") {
        return jsonResponse(SAMPLE_PAYLOAD);
      }

      if (request.method === "GET" && url.pathname === "/healthz") {
        return jsonResponse({ ok: true });
      }

      if (request.method === "POST" && url.pathname === "/html") {
        const payload = await readPayload(request);
        const html = renderQuoteTemplate(payload);
        return new Response(html, {
          headers: {
            ...corsHeaders,
            "content-type": "text/html; charset=utf-8"
          }
        });
      }

      if (request.method === "POST" && url.pathname === "/pdf") {
        const payload = await readPayload(request);
        const html = renderQuoteTemplate(payload);
        const pdf = await renderPdf(html, env);

        return new Response(pdf, {
          headers: {
            ...corsHeaders,
            "content-type": "application/pdf",
            "content-disposition": `inline; filename="quote-summary-${Date.now()}.pdf"`
          }
        });
      }

      return jsonResponse({ error: "Not found" }, 404);
    } catch (error) {
      if (error instanceof Response) {
        return error;
      }

      return jsonResponse({
        error: error instanceof Error ? error.message : "Unexpected Worker error"
      }, 500);
    }
  }
};

async function readPayload(request: Request): Promise<QuoteTemplatePayload> {
  const text = await request.text();
  if (!text.trim()) {
    return SAMPLE_PAYLOAD;
  }

  try {
    return JSON.parse(text) as QuoteTemplatePayload;
  } catch {
    throw new Response(JSON.stringify({
      error: "Request body must be valid JSON"
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        "content-type": "application/json; charset=utf-8"
      }
    });
  }
}

async function renderPdf(html: string, env: Env): Promise<Blob> {
  const browser = await puppeteer.launch(env.BROWSER);

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1600 });
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.emulateMediaType("screen");

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "16px",
        right: "16px",
        bottom: "16px",
        left: "16px"
      }
    });

    return new Blob([pdf], { type: "application/pdf" });
  } finally {
    await browser.close();
  }
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      ...corsHeaders,
      "content-type": "application/json; charset=utf-8"
    }
  });
}
