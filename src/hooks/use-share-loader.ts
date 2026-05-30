import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import toast from "react-hot-toast";

import { decodeShare, SHARE_PARAM } from "@/lib/share";
import { useEditorStore } from "@/store/editor-store";

/**
 * If the URL carries a shared document (`?d=…`), decode it into the editor and
 * strip the param so the address bar stays clean and a refresh won't re-import.
 */
export function useShareLoader() {
  const [params, setParams] = useSearchParams();
  const loadDocument = useEditorStore((s) => s.loadDocument);
  const handled = useRef(false);

  useEffect(() => {
    const raw = params.get(SHARE_PARAM);
    if (!raw || handled.current) return;
    handled.current = true;

    const doc = decodeShare(raw);

    const next = new URLSearchParams(params);
    next.delete(SHARE_PARAM);
    setParams(next, { replace: true });

    if (doc) {
      loadDocument({ content: doc.content, fileName: doc.fileName });
      toast.success("Opened shared document");
    } else {
      toast.error("This share link is invalid or corrupted");
    }
  }, [params, setParams, loadDocument]);
}
