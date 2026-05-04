import { useEffect } from "react";

const SITE_NAME = "Gadget Style";
const DEFAULT_DESCRIPTION =
  "Curated tech gadgets, gear reviews, and buying guides. Discover the latest in smart home, audio, gaming, and outdoor tech.";

/**
 * Sets `document.title` and `<meta name="description">` for the current page.
 * Pass a page-specific title like "Smart Home" — we append " | Gadget Style"
 * automatically. Pass an empty string to reset to the default.
 */
export function useDocumentTitle(title: string, description?: string): void {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Discover Premium Tech`;

    const metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (metaDesc) {
      metaDesc.content = description ?? DEFAULT_DESCRIPTION;
    }

    // Also update Open Graph tags for link previews (Slack, iMessage, etc.)
    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    if (ogDesc) ogDesc.content = description ?? DEFAULT_DESCRIPTION;
  }, [title, description]);
}
