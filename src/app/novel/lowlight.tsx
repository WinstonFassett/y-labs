import { EditorContent, ReactNodeViewRenderer, useEditor } from "@tiptap/react";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
// load all highlight.js languages
import { lowlight } from "lowlight";
import CodeBlockComponent from "./CodeBlockComponent";

lowlight.registerLanguage("html", html);
lowlight.registerLanguage("css", css);
lowlight.registerLanguage("js", js);
lowlight.registerLanguage("ts", ts);

const MenuBar = ({ editor }: any) => {
  if (!editor) {
    return null;
  }

  return (
    <button
      onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      className={editor.isActive("codeBlock") ? "is-active" : ""}
    >
      code block
    </button>
  );
};

export default CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockComponent);
  },
}).configure({ lowlight });
