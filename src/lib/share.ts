import LZString from "lz-string";

/** Query-string key carrying a shared document. */
export const SHARE_PARAM = "d";

/**
 * Conservative cross-browser/url-shortener-safe length budget. Modern browsers
 * support far longer, but links are pasted into chat apps, emails, etc.
 */
export const MAX_SHARE_LENGTH = 14000;

export interface SharedDoc {
  content: string;
  fileName?: string;
}

/** Compress a document into a URL-safe string. */
export function encodeShare(doc: SharedDoc): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(doc));
}

/** Decode a shared payload; returns null if it's missing/corrupt. */
export function decodeShare(param: string): SharedDoc | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(param);
    if (!json) return null;
    const parsed: unknown = JSON.parse(json);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as SharedDoc).content === "string"
    ) {
      const { content, fileName } = parsed as SharedDoc;
      return {
        content,
        fileName: typeof fileName === "string" ? fileName : undefined,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/** Build a full shareable URL for the current origin + editor route. */
export function buildShareUrl(doc: SharedDoc): string {
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set(SHARE_PARAM, encodeShare(doc));
  return url.toString();
}
