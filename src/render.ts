import { BASE_TEMPLATE } from "./generated-template.ts";

export interface QuoteTemplatePayload {
  quote?: {
    design_id?: string;
    createdAt?: string;
    deliveryRange?: string;
    additionalInstructions?: string;
  };
  product?: {
    previewImageUrl?: string;
    previewImageAlt?: string;
    title?: string;
    subtitle?: string;
    changeRequest?: string;
    options?: Array<string | { label?: string }>;
    specifications?: Array<{
      label?: string;
      value?: string;
    }>;
  };
}

const STATIC_CONTENT = {
  pageTitle: "Your Sign Quote Summary - JIXTA",
  previewText:
    "Your sign quote summary is ready with order details, specifications, delivery estimate, and next steps.",
  deliveryLabel: "Estimated Delivery",
};

export const SAMPLE_PAYLOAD: QuoteTemplatePayload = {
  quote: {
    design_id: "DESIGN-2026-00125",
    createdAt: "2026-04-24",
    deliveryRange: "Mar 03 to Mar 06",
    additionalInstructions: "Delivery before Christmas",
  },
  product: {
    previewImageUrl:
      "https://cdn.shopify.com/s/files/1/0803/2216/7027/files/neon-sign-preview.png?v=1777012233",
    previewImageAlt: "Neon sign preview",
    title: "Indoor Product: Neon Static Signs",
    subtitle: "Size selected 22 in - Cut to shape - Static",
    changeRequest: "Change the light color of the garage text into red",
    options: ["Double-Sided LED +$50", "US Plug +$50"],
    specifications: [
      {
        label: "Sign Type",
        value: "Neon Static Sign",
      },
      {
        label: "Size",
        value: "22 in Width x 14 in Height",
      },
      {
        label: "Intended Use",
        value: "Indoor Branding",
      },
      {
        label: "Mounting",
        value: "Wall Mount (Flush)",
      },
      {
        label: "Power",
        value: "US Standard Plug (12V)",
      },
      {
        label: "Voltage",
        value: "110V - 240V",
      },
      {
        label: "Warranty",
        value: "36 Months",
      },
    ],
  },
};

export function renderQuoteTemplate(
  payload: QuoteTemplatePayload = {},
): string {
  const data = mergePayload(payload);

  const tokens: Record<string, string> = {
    PAGE_TITLE: escapeHtml(STATIC_CONTENT.pageTitle),
    PREVIEW_TEXT: escapeHtml(STATIC_CONTENT.previewText),
    PREVIEW_IMAGE_URL: sanitizeAssetUrl(
      data.product.previewImageUrl,
      SAMPLE_PAYLOAD.product?.previewImageUrl ?? "",
    ),
    PREVIEW_IMAGE_ALT: escapeHtml(data.product.previewImageAlt),
    PRODUCT_TITLE: escapeHtml(data.product.title),
    PRODUCT_SUBTITLE: escapeHtml(data.product.subtitle),
    OPTION_BADGES: buildOptionBadges(data.product.options),
    CHANGE_REQUEST_SECTION: buildChangeRequestSection(
      data.product.changeRequest,
    ),
    SPECIFICATION_ROWS: buildSpecificationRows(data),
    DELIVERY_LABEL: escapeHtml(STATIC_CONTENT.deliveryLabel),
    DELIVERY_RANGE: escapeHtml(data.quote.deliveryRange),
    ADDITIONAL_INSTRUCTIONS_SECTION: buildAdditionalInstructionsSection(
      data.quote.additionalInstructions,
    ),
  };

  let html = BASE_TEMPLATE;
  for (const [token, value] of Object.entries(tokens)) {
    html = html.replaceAll(`{{${token}}}`, value);
  }

  return html.replace(/{{[A-Z0-9_]+}}/g, "");
}

type ResolvedPayload = {
  quote: {
    design_id: string;
    createdAt: string;
    deliveryRange: string;
    additionalInstructions: string;
  };
  product: {
    previewImageUrl: string;
    previewImageAlt: string;
    title: string;
    subtitle: string;
    changeRequest: string;
    options: Array<string | { label: string }>;
    specifications: Array<{ label: string; value: string }>;
  };
};

function mergePayload(payload: QuoteTemplatePayload): ResolvedPayload {
  return {
    quote: {
      design_id: pickString(payload.quote?.design_id),
      createdAt: pickString(payload.quote?.createdAt),
      deliveryRange: pickString(
        payload.quote?.deliveryRange,
        SAMPLE_PAYLOAD.quote?.deliveryRange,
      ),
      additionalInstructions: pickString(payload.quote?.additionalInstructions),
    } as ResolvedPayload["quote"],
    product: {
      previewImageUrl: pickString(
        payload.product?.previewImageUrl,
        SAMPLE_PAYLOAD.product?.previewImageUrl,
      ),
      previewImageAlt: pickString(
        payload.product?.previewImageAlt,
        SAMPLE_PAYLOAD.product?.previewImageAlt,
      ),
      title: pickString(payload.product?.title, SAMPLE_PAYLOAD.product?.title),
      subtitle: pickString(
        payload.product?.subtitle,
        SAMPLE_PAYLOAD.product?.subtitle,
      ),
      changeRequest: pickString(payload.product?.changeRequest),
      options: normalizeOptions(
        payload.product?.options ?? SAMPLE_PAYLOAD.product?.options ?? [],
      ),
      specifications: normalizeSpecifications(
        payload.product?.specifications ??
          SAMPLE_PAYLOAD.product?.specifications ??
          [],
      ),
    } as ResolvedPayload["product"],
  };
}

function buildOptionBadges(options: Array<string | { label: string }>): string {
  const labels = options
    .map((option) =>
      typeof option === "string" ? option : pickString(option?.label),
    )
    .map((label) => label.trim())
    .filter(Boolean);

  if (labels.length === 0) {
    return "";
  }

  return `<div class="badge-row">${labels.map((label) => `<span class="badge">${escapeHtml(label)}</span>`).join("")}</div>`;
}

function buildChangeRequestSection(changeRequest: string): string {
  if (!changeRequest.trim()) {
    return "";
  }

  return `
        <div class="note-wrap">
          <p class="note-label">Request Changes</p>
          <div class="note-body-box">
            <p class="note-body">${escapeHtml(changeRequest)}</p>
          </div>
        </div>`;
}

function buildSpecificationRows(data: ResolvedPayload): string {
  const rows = [
    ...buildQuoteRows(data.quote),
    ...data.product.specifications,
  ];

  return rows
    .map(
      (row) => `
          <div class="spec-item">
            <div class="spec-label">${escapeHtml(row.label)}</div>
            <div class="spec-value">${escapeHtml(row.value)}</div>
          </div>`,
    )
    .join("");
}

function buildQuoteRows(
  quote: ResolvedPayload["quote"],
): Array<{ label: string; value: string }> {
  const rows: Array<{ label: string; value: string }> = [];

  if (quote.design_id.trim()) {
    rows.push({ label: "Design ID", value: quote.design_id });
  }

  if (quote.createdAt.trim()) {
    rows.push({ label: "Quote Date", value: quote.createdAt });
  }

  return rows;
}

function buildAdditionalInstructionsSection(
  additionalInstructions: string,
): string {
  if (!additionalInstructions.trim()) {
    return "";
  }

  return `
        <div class="delivery-note">
          <p class="note-label">Additional Instructions</p>
          <div class="note-body-box" style="border-radius: 4px;">
            <p class="note-body">"${escapeHtml(additionalInstructions)}"</p>
          </div>
        </div>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sanitizeAssetUrl(value: string, fallback: string): string {
  const url = value.trim();
  if (/^(https?:\/\/|data:image\/)/i.test(url)) {
    return url;
  }
  return fallback;
}

function pickString(value: unknown, fallback?: string): string {
  return typeof value === "string" ? value : (fallback ?? "");
}

function normalizeOptions(
  options: Array<string | { label?: string }>,
): Array<string | { label: string }> {
  return options
    .map((option) => {
      if (typeof option === "string") {
        return option;
      }

      if (option && typeof option === "object") {
        return { label: pickString(option.label) };
      }

      return "";
    })
    .filter((option) =>
      typeof option === "string"
        ? option.trim().length > 0
        : option.label.trim().length > 0,
    );
}

function normalizeSpecifications(
  rows: Array<{ label?: string; value?: string }>,
): Array<{ label: string; value: string }> {
  return rows
    .map((row) => ({
      label: pickString(row?.label),
      value: pickString(row?.value),
    }))
    .filter(
      (row) => row.label.trim().length > 0 && row.value.trim().length > 0,
    );
}
