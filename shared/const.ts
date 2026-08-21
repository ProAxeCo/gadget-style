/**
 * Cross-cutting constants.
 *
 * AFFILIATE_TAG is the single source of truth for the Amazon Associates
 * tracking tag — scripts import it from here rather than hardcoding, so a
 * future tag change (e.g. adding the AU marketplace tag) is one edit.
 *
 * (COOKIE_NAME / ONE_YEAR_MS were Manus-era session constants with no
 * remaining consumers — removed.)
 */
export const AFFILIATE_TAG = "gadgetstyle01-20";
