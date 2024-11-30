import { indentWithTab } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { EditorState } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView, keymap } from "@codemirror/view";
import { useStore } from "@nanostores/react";
import { basicSetup } from "codemirror";
import { useEffect, useRef } from "react";
import { yCollab } from "y-codemirror.next";
import { useTheme } from "../../lib/astro-tailwind-themes/useTheme";
import { getDocLoadState } from "../shared/store/doc-loader";
import { useDocCollabStore } from "../shared/useDocCollabStore";
import "./codemirror.css";

function Codemirror({ className = "" }: { className?: string }) {
  const editor = useRef<HTMLDivElement>(null);
  const [theme] = useTheme();

  const { docId, ydoc, $room, roomId, needsPasswordToConnect } = useDocCollabStore();
  const loadState = useStore(getDocLoadState(docId, roomId));
  const fragment = ydoc.getXmlFragment("novel");
  const provider = $room?.get().provider;
  const loaded = loadState === "loaded";

  useEffect(
    function setupCodemirror() {
      if (!editor.current) return;
      const ytext = ydoc.getText("codemirror");
      const customBackgroundExtension = EditorView.theme(
        {
          "&.cm-editor": {
            backgroundColor: "inherit", // Set the background to inherit from the parent element
          },
          "&.cm-editor .cm-gutters": {
            backgroundColor: "inherit", // Set the background to inherit from the parent element
          },
        },
        { dark: true },
      );

      const themeExtensions =
        theme === "dark" ? [oneDark, customBackgroundExtension] : [];
      const collabExtensions = provider
        ? yCollab(ytext, provider.awareness)
        : [];
      const startState = EditorState.create({
        doc: ytext.toString(),
        extensions: [
          basicSetup,
          keymap.of([indentWithTab]),
          javascript(),
          themeExtensions,
          collabExtensions,
        ],
      });

      const view = new EditorView({
        state: startState,
        parent: editor.current,
      });
      return () => {
        view.destroy();
      };
    },
    [theme, provider, loaded],
  );
  return <div ref={editor} className={className}></div>;
}

export default Codemirror;
