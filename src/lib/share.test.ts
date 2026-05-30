import { describe, it, expect } from "vitest";
import LZString from "lz-string";

import {
  buildShareUrl,
  decodeShare,
  encodeShare,
  SHARE_PARAM,
} from "./share";

describe("share encode/decode", () => {
  it("round-trips a document with a file name", () => {
    const doc = { content: "# Title\n\n**bold** & <html>", fileName: "note.md" };
    const encoded = encodeShare(doc);
    expect(typeof encoded).toBe("string");
    expect(decodeShare(encoded)).toEqual(doc);
  });

  it("round-trips content without a file name", () => {
    const encoded = encodeShare({ content: "just text" });
    expect(decodeShare(encoded)).toEqual({
      content: "just text",
      fileName: undefined,
    });
  });

  it("returns null for empty or corrupt input", () => {
    expect(decodeShare("")).toBeNull();
    expect(decodeShare("not-a-valid-payload$$$")).toBeNull();
  });

  it("returns null when the decoded payload has no string content", () => {
    const bad = LZString.compressToEncodedURIComponent(
      JSON.stringify({ foo: 1 }),
    );
    expect(decodeShare(bad)).toBeNull();
  });

  it("builds a URL whose param round-trips back to the document", () => {
    const doc = { content: "hello", fileName: "a.md" };
    const url = buildShareUrl(doc);
    const param = new URL(url).searchParams.get(SHARE_PARAM);
    expect(param).toBeTruthy();
    expect(decodeShare(param!)).toEqual(doc);
  });
});
