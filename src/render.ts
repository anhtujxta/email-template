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
    heroCopy: "Thanks for choosing us for neon logo LED signs. Here is the full summary of what you selected:",
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
    CUSTOMER_INFO_SECTION: buildCustomerInfoSection(data),
    PREVIEW_IMAGE_URL: sanitizeAssetUrl(data.product.previewImageUrl, SAMPLE_PAYLOAD.product?.previewImageUrl ?? ""),
    PREVIEW_IMAGE_ALT: escapeHtml(data.product.previewImageAlt),
    PRODUCT_TITLE: escapeHtml(data.product.title),
    PRODUCT_SUBTITLE: escapeHtml(data.product.subtitle),
    OPTION_BADGES: buildOptionBadges(data.options),
    CHANGE_REQUEST_SECTION: buildChangeRequestSection(data.product.changeRequest),
    SPECIFICATION_ROWS: buildSpecificationRows(data.specifications),
    DELIVERY_LABEL: escapeHtml(data.quote.deliveryLabel),
    DELIVERY_RANGE: escapeHtml(data.quote.deliveryRange),
    ADDITIONAL_INSTRUCTIONS_SECTION: buildAdditionalInstructionsSection(data.quote.additionalInstructions),
    CTA_URL: sanitizeHref(data.quote.ctaUrl, SAMPLE_PAYLOAD.quote?.ctaUrl ?? "https://jixta.com/cart"),
    CTA_TEXT: escapeHtml(data.quote.ctaText),
    FACEBOOK_URL: sanitizeHref(data.brand.facebookUrl, SAMPLE_PAYLOAD.brand?.facebookUrl ?? "https://facebook.com/jixta"),
    INSTAGRAM_URL: sanitizeHref(data.brand.instagramUrl, SAMPLE_PAYLOAD.brand?.instagramUrl ?? "https://instagram.com/jixta"),
    TWITTER_URL: sanitizeHref(data.brand.twitterUrl, SAMPLE_PAYLOAD.brand?.twitterUrl ?? "https://twitter.com/jixta"),
    LINKEDIN_URL: sanitizeHref(data.brand.linkedinUrl, SAMPLE_PAYLOAD.brand?.linkedinUrl ?? "https://linkedin.com/company/jixta"),
    COMPANY_ADDRESS: escapeHtml(data.brand.companyAddress),
    SUPPORT_PHONE: escapeHtml(data.brand.supportPhone),
    SUPPORT_EMAIL: escapeHtml(data.brand.supportEmail)
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

function buildCustomerInfoSection(payload: ResolvedPayload): string {
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

  if (rows.length === 0) {
    return "";
  }

  const content = rows
    .map((row, index) => {
      const isLast = index === rows.length - 1;
      return `
                <tr>
                  <td style="${isLast ? "padding: 8px 0 0;" : "border-bottom: 1px solid #edeef0; padding: 8px 0 9px;"}">
                    <table role="presentation" class="spec-row-table" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 16px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #414754; white-space: nowrap; padding-right: 16px;">
                          ${escapeHtml(row.label)}
                        </td>
                        <td class="spec-value" align="right" style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 20px; font-weight: 500; color: #191C1E;">
                          ${escapeHtml(row.value)}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>`;
    })
    .join("");

  return `
                <tr>
                  <td style="padding-bottom: 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; background-color: #ffffff; border: 1px solid #e7e8ea; border-radius: 16px;">
                      <tr>
                        <td class="card-pad" style="padding: 25px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="font-family: Arial, Helvetica, sans-serif; font-size: 18px; line-height: 28px; font-weight: 700; color: #191C1E; padding-bottom: 16px;">
                                Quote details
                              </td>
                            </tr>
                            ${content}
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>`;
}

function buildOptionBadges(options: Array<string | { label: string }>): string {
  const labels = options
    .map((option) => typeof option === "string" ? option : pickString(option?.label))
    .map((label) => label.trim())
    .filter(Boolean);

  if (labels.length === 0) {
    return "";
  }

  const cells = labels
    .map((label) => `
                                                <td style="padding-right: 12px; padding-bottom: 8px;">
                                                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color: #d6e3ff; border-radius: 12px;">
                                                    <tr>
                                                      <td style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 16px; font-weight: 700; color: #00468c; padding: 6px 16px; white-space: nowrap;">
                                                        ${escapeHtml(label)}
                                                      </td>
                                                    </tr>
                                                  </table>
                                                </td>`)
    .join("");

  return `
                                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                              <tr>${cells}
                                              </tr>
                                            </table>`;
}

function buildChangeRequestSection(changeRequest: string): string {
  if (!changeRequest.trim()) {
    return "";
  }

  return `
                            <tr>
                              <td style="padding-top: 24px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; background-color: #f2f4f6; border-radius: 12px;">
                                  <tr>
                                    <td style="padding: 24px;">
                                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                          <td style="font-family: Arial, Helvetica, sans-serif; font-size: 10px; line-height: 15px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #414754; padding-bottom: 12px;">
                                            Request Changes
                                          </td>
                                        </tr>
                                        <tr>
                                          <td style="background-color: #ffffff; border: 1px solid #dee3ea; border-radius: 8px; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 20px; color: #191C1E; padding: 17px;">
                                            ${escapeHtml(changeRequest)}
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>`;
}

function buildSpecificationRows(rows: Array<{ label: string; value: string }>): string {
  const normalizedRows = rows.filter((row) => row.label.trim() && row.value.trim());
  if (normalizedRows.length === 0) {
    return "";
  }

  return normalizedRows
    .map((row, index) => {
      const isLast = index === normalizedRows.length - 1;
      return `
                            <tr>
                              <td style="${isLast ? "padding: 8px 0 0;" : "border-bottom: 1px solid #edeef0; padding: 8px 0 9px;"}">
                                <table role="presentation" class="spec-row-table" width="100%" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 16px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #414754; white-space: nowrap; padding-right: 16px;">
                                      ${escapeHtml(row.label)}
                                    </td>
                                    <td class="spec-value" align="right" style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 20px; font-weight: 500; color: #191C1E;">
                                      ${escapeHtml(row.value)}
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>`;
    })
    .join("");
}

function buildAdditionalInstructionsSection(additionalInstructions: string): string {
  if (!additionalInstructions.trim()) {
    return "";
  }

  return `
                            <tr>
                              <td style="padding-top: 8px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td style="font-family: Arial, Helvetica, sans-serif; font-size: 10px; line-height: 15px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #414754; padding-bottom: 8px;">
                                      Additional Instructions
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="background-color: #ffffff; border: 1px solid #dee3ea; border-radius: 8px; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 20px; color: #191C1E; padding: 17px;">
                                      ${escapeHtml(additionalInstructions)}
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>`;
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
