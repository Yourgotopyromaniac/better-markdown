import { EditorToolbar } from "@/components/editor/editor-toolbar";
import { EditorWorkspace } from "@/components/editor/editor-workspace";
import { useShareLoader } from "@/hooks/use-share-loader";

/** Editor + live preview workspace (the app's home route). */
export default function EditorPage() {
  // Import a shared document if the URL carries one.
  useShareLoader();

  return (
    <div className="flex h-full flex-col">
      <EditorToolbar />
      <EditorWorkspace />
    </div>
  );
}
