import React from 'react';
import { Editor, rootCtx } from '@milkdown/kit/core';
import { nord } from '@milkdown/theme-nord';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { commonmark } from '@milkdown/kit/preset/commonmark';
import { splitEditing } from '@milkdown-lab/plugin-split-editing'
import './style.css';

const MilkdownEditor: React.FC = () => {
    const { get } = useEditor((root) =>
      Editor.make()
        .config(nord)
        .config((ctx) => {
          ctx.set(rootCtx, root);
        })
        .use(commonmark)
        .use(splitEditing)
  );

  return <Milkdown />;
};

const MilkdownEditorWrapper: React.FC = () => {
  return (
    <MilkdownProvider>
      <MilkdownEditor />
    </MilkdownProvider>
  );
};
export default MilkdownEditorWrapper;