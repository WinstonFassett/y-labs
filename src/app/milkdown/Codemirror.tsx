import { indentWithTab } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { EditorState } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView, keymap } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { useEffect, useMemo, useRef } from "react";
import { yCollab } from "y-codemirror.next";
import { useTheme } from "../../lib/astro-tailwind-themes/useTheme";
import { useDocEditor } from "../shared/useDocEditor";
import "./codemirror.css";

function Codemirror({ className = "" }: { className?: string }) {
  const editor = useRef<HTMLDivElement>(null);
  const [theme] = useTheme();

  const { docId, currentDoc, $room, roomId, loadState, loaded, provider } = useDocEditor();
  const ytext = currentDoc.getText("codemirror");

  const extensions = useMemo(() => {
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
    const collabExtensions = yCollab(ytext, provider?.awareness)      
    return [basicSetup, keymap.of([indentWithTab]), javascript(), themeExtensions, collabExtensions];
  }, [currentDoc, theme, provider, loaded]);

  useEffect(
    function setupCodemirror() {
      if (!editor.current || !loaded) return;
      
      const startState = EditorState.create({
        doc: ytext.toString(),
        extensions,
      });
      const view = new EditorView({
        state: startState,
        parent: editor.current,
      });
      return () => {
        view.destroy();
      };
    },
    [extensions, loaded],
  );
  return <div ref={editor} className={className}></div>;
}

export default Codemirror;
