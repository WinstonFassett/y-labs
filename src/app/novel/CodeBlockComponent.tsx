import "./CodeBlockComponent.scss";

import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import React from "react";

export default ({
  // node: {
  //   attrs: { language: defaultLanguage },
  // },
  // updateAttributes,
  // extension,
}: any) => (
  <NodeViewWrapper className="code-block not-prose">
    {/* <select
      contentEditable={false}
      defaultValue={defaultLanguage}
      onChange={(event) => updateAttributes({ language: event.target.value })}
    >
      <option value="null">auto</option>
      <option disabled>—</option>
      {extension.options.lowlight.listLanguages().map((lang, index) => (
        <option key={index} value={lang}>
          {lang}
        </option>
      ))}
    </select> */}
    <pre className="rounded-sm bg-muted border p-5 font-mono font-medium">
      <NodeViewContent as="code" />
    </pre>
  </NodeViewWrapper>
);
