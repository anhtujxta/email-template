import { BASE_TEMPLATE } from "./generated-template.ts";

export interface QuoteTemplatePayload {
  brand?: {
    pageTitle?: string;
    previewText?: string;
    logoUrl?: string;
    logoAlt?: string;
    companyAddress?: string;
    supportPhone?: string;
    supportEmail?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    twitterUrl?: string;
    linkedinUrl?: string;
  };
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  quote?: {
    number?: string;
    createdAt?: string;
    ctaUrl?: string;
    ctaText?: string;
    deliveryLabel?: string;
    deliveryRange?: string;
    additionalInstructions?: string;
  };
  product?: {
    heroTitle?: string;
    heroCopy?: string;
    previewImageUrl?: string;
    previewImageAlt?: string;
    title?: string;
    subtitle?: string;
    changeRequest?: string;
  };
  options?: Array<string | { label: string }>;
  specifications?: Array<{
    label: string;
    value: string;
  }>;
}

export const SAMPLE_PAYLOAD: QuoteTemplatePayload = {
  customer: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 555 000 1111"
  },
  quote: {
    number: "QT-2026-00125",
    createdAt: "2026-04-24",
    ctaUrl: "https://jixta.com/cart",
    ctaText: "Return to my cart",
    deliveryLabel: "Estimated Delivery",
    deliveryRange: "Mar 03 to Mar 06",
    additionalInstructions: "Delivery before Christmas"
  },
  product: {
    heroTitle: "Your Sign Quote Summary",
    heroCopy: "Thanks for choosing us for your neon logo LED sign. Review the final configuration below before checkout.",
    previewImageUrl: "https://cdn.shopify.com/s/files/1/0803/2216/7027/files/neon-sign-preview.png?v=1777012233",
    previewImageAlt: "Neon sign preview",
    title: "Indoor Product: Neon Static Signs",
    subtitle: "Size selected 22 in - Cut to shape - Static",
    changeRequest: "Change the light color of the garage text into red"
  },
  options: [
    "Double-Sided LED +$50",
    "US Plug +$50"
  ],
  specifications: [
    {
      label: "Sign Type",
      value: "Neon Static Sign"
    },
    {
      label: "Size",
      value: "22 in Width x 14 in Height"
    },
    {
      label: "Intended Use",
      value: "Indoor Branding"
    },
    {
      label: "Mounting",
      value: "Wall Mount (Flush)"
    },
    {
      label: "Power",
      value: "US Standard Plug (12V)"
    },
    {
      label: "Voltage",
      value: "110V - 240V"
    },
    {
      label: "Warranty",
      value: "36 Months"
    }
  ],
  brand: {
    pageTitle: "Your Sign Quote Summary - JIXTA",
    previewText: "Your sign quote summary is ready with order details, specifications, delivery estimate, and next steps.",
    logoUrl: "https://cdn.shopify.com/s/files/1/0803/2216/7027/files/jixta-logo.png?v=1777012232",
    logoAlt: "JIXTA",
    companyAddress: "5900 Balcones Dr Ste 100, Austin, TX 78731, USA",
    supportPhone: "+1 (409) 916-7828",
    supportEmail: "Support@jixta.com",
    facebookUrl: "https://facebook.com/jixta",
    instagramUrl: "https://instagram.com/jixta",
    twitterUrl: "https://twitter.com/jixta",
    linkedinUrl: "https://linkedin.com/company/jixta"
  }
};

export function renderQuoteTemplate(payload: QuoteTemplatePayload = {}): string {
  const data = mergePayload(payload);

  const tokens: Record<string, string> = {
    PAGE_TITLE: escapeHtml(data.brand.pageTitle),
    PREVIEW_TEXT: escapeHtml(data.brand.previewText),
    LOGO_URL: sanitizeAssetUrl(data.brand.logoUrl, SAMPLE_PAYLOAD.brand?.logoUrl ?? ""),
    LOGO_ALT: escapeHtml(data.brand.logoAlt),
    HERO_TITLE: escapeHtml(data.product.heroTitle),
    HERO_COPY: escapeHtml(data.product.heroCopy),
    PREVIEW_IMAGE_URL: sanitizeAssetUrl(data.product.previewImageUrl, SAMPLE_PAYLOAD.product?.previewImageUrl ?? ""),
    PREVIEW_IMAGE_ALT: escapeHtml(data.product.previewImageAlt),
    PRODUCT_TITLE: escapeHtml(data.product.title),
    PRODUCT_SUBTITLE: escapeHtml(data.product.subtitle),
    OPTION_BADGES: buildOptionBadges(data.options),
    QUOTE_META_ITEMS: buildQuoteMetaItems(data),
    DELIVERY_CARD: buildDeliveryCard(data.quote.deliveryLabel, data.quote.deliveryRange),
    SPECIFICATION_ITEMS: buildSpecificationItems(data.specifications),
    NOTES_SECTION: buildNotesSection(data),
    CTA_URL: sanitizeHref(data.quote.ctaUrl, SAMPLE_PAYLOAD.quote?.ctaUrl ?? "https://jixta.com/cart"),
    CTA_TEXT: escapeHtml(data.quote.ctaText),
    COMPANY_ADDRESS: escapeHtml(data.brand.companyAddress),
    SUPPORT_LINE: buildSupportLine(data)
  };

  let html = BASE_TEMPLATE;
  for (const [token, value] of Object.entries(tokens)) {
    html = html.replaceAll(`{{${token}}}`, value);
  }

  return html.replace(/{{[A-Z0-9_]+}}/g, "");
}

type ResolvedPayload = Required<QuoteTemplatePayload> & {
  brand: Required<NonNullable<QuoteTemplatePayload["brand"]>>;
  customer: Required<NonNullable<QuoteTemplatePayload["customer"]>>;
  quote: Required<NonNullable<QuoteTemplatePayload["quote"]>>;
  product: Required<NonNullable<QuoteTemplatePayload["product"]>>;
  options: Array<string | { label: string }>;
  specifications: Array<{ label: string; value: string }>;
};

function mergePayload(payload: QuoteTemplatePayload): ResolvedPayload {
  return {
    brand: {
      pageTitle: pickString(payload.brand?.pageTitle, SAMPLE_PAYLOAD.brand?.pageTitle),
      previewText: pickString(payload.brand?.previewText, SAMPLE_PAYLOAD.brand?.previewText),
      logoUrl: pickString(payload.brand?.logoUrl, SAMPLE_PAYLOAD.brand?.logoUrl),
      logoAlt: pickString(payload.brand?.logoAlt, SAMPLE_PAYLOAD.brand?.logoAlt),
      companyAddress: pickString(payload.brand?.companyAddress, SAMPLE_PAYLOAD.brand?.companyAddress),
      supportPhone: pickString(payload.brand?.supportPhone, SAMPLE_PAYLOAD.brand?.supportPhone),
      supportEmail: pickString(payload.brand?.supportEmail, SAMPLE_PAYLOAD.brand?.supportEmail),
      facebookUrl: pickString(payload.brand?.facebookUrl, SAMPLE_PAYLOAD.brand?.facebookUrl),
      instagramUrl: pickString(payload.brand?.instagramUrl, SAMPLE_PAYLOAD.brand?.instagramUrl),
      twitterUrl: pickString(payload.brand?.twitterUrl, SAMPLE_PAYLOAD.brand?.twitterUrl),
      linkedinUrl: pickString(payload.brand?.linkedinUrl, SAMPLE_PAYLOAD.brand?.linkedinUrl)
    } as ResolvedPayload["brand"],
    customer: {
      name: pickString(payload.customer?.name),
      email: pickString(payload.customer?.email),
      phone: pickString(payload.customer?.phone)
    },
    quote: {
      number: pickString(payload.quote?.number),
      createdAt: pickString(payload.quote?.createdAt),
      ctaUrl: pickString(payload.quote?.ctaUrl, SAMPLE_PAYLOAD.quote?.ctaUrl),
      ctaText: pickString(payload.quote?.ctaText, SAMPLE_PAYLOAD.quote?.ctaText),
      deliveryLabel: pickString(payload.quote?.deliveryLabel, SAMPLE_PAYLOAD.quote?.deliveryLabel),
      deliveryRange: pickString(payload.quote?.deliveryRange, SAMPLE_PAYLOAD.quote?.deliveryRange),
      additionalInstructions: pickString(payload.quote?.additionalInstructions)
    } as ResolvedPayload["quote"],
    product: {
      heroTitle: pickString(payload.product?.heroTitle, SAMPLE_PAYLOAD.product?.heroTitle),
      heroCopy: pickString(payload.product?.heroCopy, SAMPLE_PAYLOAD.product?.heroCopy),
      previewImageUrl: pickString(payload.product?.previewImageUrl, SAMPLE_PAYLOAD.product?.previewImageUrl),
      previewImageAlt: pickString(payload.product?.previewImageAlt, SAMPLE_PAYLOAD.product?.previewImageAlt),
      title: pickString(payload.product?.title, SAMPLE_PAYLOAD.product?.title),
      subtitle: pickString(payload.product?.subtitle, SAMPLE_PAYLOAD.product?.subtitle),
      changeRequest: pickString(payload.product?.changeRequest)
    } as ResolvedPayload["product"],
    options: normalizeOptions(payload.options ?? SAMPLE_PAYLOAD.options ?? []),
    specifications: normalizeSpecifications(payload.specifications ?? SAMPLE_PAYLOAD.specifications ?? [])
  };
}

function buildQuoteMetaItems(payload: ResolvedPayload): string {
  const rows: Array<{ label: string; value: string }> = [];

  if (payload.customer.name) {
    rows.push({ label: "Customer", value: payload.customer.name });
  }
  if (payload.customer.email) {
    rows.push({ label: "Email", value: payload.customer.email });
  }
  if (payload.customer.phone) {
    rows.push({ label: "Phone", value: payload.customer.phone });
  }
  if (payload.quote.number) {
    rows.push({ label: "Quote No.", value: payload.quote.number });
  }
  if (payload.quote.createdAt) {
    rows.push({ label: "Created", value: payload.quote.createdAt });
  }

  return rows
    .map((row) => `
            <div class="meta-item">
              <div class="meta-label">${escapeHtml(row.label)}</div>
              <div class="meta-value">${escapeHtml(row.value)}</div>
            </div>`)
    .join("");
}

function buildOptionBadges(options: Array<string | { label: string }>): string {
  const labels = options
    .map((option) => typeof option === "string" ? option : pickString(option?.label))
    .map((label) => label.trim())
    .filter(Boolean);

  if (labels.length === 0) {
    return "";
  }

  const badges = labels
    .map((label) => `<span class="badge">${escapeHtml(label)}</span>`)
    .join("");

  return `<div class="badge-row">${badges}</div>`;
}

function buildDeliveryCard(label: string, range: string): string {
  if (!range.trim()) {
    return "";
  }

  return `
          <div class="delivery-card">
            <p class="delivery-label">${escapeHtml(label || "Estimated Delivery")}</p>
            <p class="delivery-range">${escapeHtml(range)}</p>
          </div>`;
}

function buildSpecificationItems(rows: Array<{ label: string; value: string }>): string {
  return rows
    .map((row) => `
          <div class="spec-item">
            <div class="spec-label">${escapeHtml(row.label)}</div>
            <div class="spec-value">${escapeHtml(row.value)}</div>
          </div>`)
    .join("");
}

function buildNotesSection(payload: ResolvedPayload): string {
  const notes: string[] = [];

  if (payload.product.changeRequest.trim()) {
    notes.push(`
        <article class="note-card">
          <p class="note-title">Requested Changes</p>
          <p class="note-body">${escapeHtml(payload.product.changeRequest)}</p>
        </article>`);
  }

  if (payload.quote.additionalInstructions.trim()) {
    notes.push(`
        <article class="note-card">
          <p class="note-title">Additional Instructions</p>
          <p class="note-body">${escapeHtml(payload.quote.additionalInstructions)}</p>
        </article>`);
  }

  if (notes.length === 0) {
    return "";
  }

  return `
      <section class="notes-grid">
        ${notes.join("")}
      </section>`;
}

function buildSupportLine(payload: ResolvedPayload): string {
  const items: string[] = [];

  if (payload.brand.supportPhone.trim()) {
    items.push(`Phone: ${escapeHtml(payload.brand.supportPhone)}`);
  }
  if (payload.brand.supportEmail.trim()) {
    items.push(`Email: ${escapeHtml(payload.brand.supportEmail)}`);
  }

  return items.join(" | ");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sanitizeHref(value: string, fallback: string): string {
  const url = value.trim();
  if (/^(https?:\/\/|mailto:|tel:)/i.test(url)) {
    return url;
  }
  return fallback;
}

function sanitizeAssetUrl(value: string, fallback: string): string {
  const url = value.trim();
  if (/^(https?:\/\/|data:image\/)/i.test(url)) {
    return url;
  }
  return fallback;
}

function pickString(value: unknown, fallback?: string): string {
  return typeof value === "string" ? value : fallback ?? "";
}

function normalizeOptions(options: Array<string | { label: string }>): Array<string | { label: string }> {
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
    .filter((option) => typeof option === "string" ? option.trim().length > 0 : option.label.trim().length > 0);
}

function normalizeSpecifications(rows: Array<{ label: string; value: string }>): Array<{ label: string; value: string }> {
  return rows
    .map((row) => ({
      label: pickString(row?.label),
      value: pickString(row?.value)
    }))
    .filter((row) => row.label.trim().length > 0 && row.value.trim().length > 0);
}
