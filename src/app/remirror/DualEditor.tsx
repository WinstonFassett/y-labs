// DualEditor.tsx
import '@remirror/styles/all.css';
import { css } from '@emotion/css';
import { createContextState } from 'create-context-state';
import React from 'react';
import { ExtensionPriority, getThemeVar } from 'remirror';
import {
  BlockquoteExtension,
  BoldExtension,
  BulletListExtension,
  CodeBlockExtension,
  CodeExtension,
  DocExtension,
  HardBreakExtension,
  HeadingExtension,
  ItalicExtension,
  LinkExtension,
  ListItemExtension,
  MarkdownExtension,
  OrderedListExtension,
  StrikeExtension,
  TableExtension,
  TrailingNodeExtension,
} from 'remirror/extensions';
import {
  Remirror,
  ThemeProvider,
  useHelpers,
  useRemirror,
  type UseRemirrorReturn,
  type ReactExtensions,
} from '@remirror/react';
import { MarkdownToolbar } from '@remirror/react-ui';
import jsx from 'refractor/lang/jsx.js';
import typescript from 'refractor/lang/typescript.js';
import md from 'refractor/lang/markdown.js';

const extensions = () => [
  new LinkExtension({ autoLink: true }),
  new BoldExtension(),
  new StrikeExtension(),
  new ItalicExtension(),
  new HeadingExtension(),
  new BlockquoteExtension(),
  new BulletListExtension({ enableSpine: true }),
  new OrderedListExtension(),
  new ListItemExtension({ priority: ExtensionPriority.High, enableCollapsible: true }),
  new CodeExtension(),
  new CodeBlockExtension({ supportedLanguages: [jsx, typescript] }),
  new TrailingNodeExtension(),
  new TableExtension(),
  new MarkdownExtension({ copyAsMarkdown: false }),
  new HardBreakExtension(),
];

interface Context extends Props {
  setMarkdown: (markdown: string) => void;
  setVisual: (markdown: string) => void;
}

interface Props {
  visual: UseRemirrorReturn<ReactExtensions<ReturnType<typeof extensions>[number]>>;
  markdown: UseRemirrorReturn<ReactExtensions<DocExtension | CodeBlockExtension>>;
}

const [DualEditorProvider, useDualEditor] = createContextState<Context, Props>(({ props }) => ({
  ...props,
  setMarkdown: (text: string) =>
    props.markdown.getContext()?.setContent({
      type: 'doc',
      content: [
        {
          type: 'codeBlock',
          attrs: { language: 'markdown' },
          content: text ? [{ type: 'text', text }] : undefined,
        },
      ],
    }),
  setVisual: (markdown: string) => props.visual.getContext()?.setContent(markdown),
}));

const MarkdownTextEditor = () => {
  const { markdown, setVisual } = useDualEditor();

  return (
    <Remirror
      manager={markdown.manager}
      autoRender="end"
      onChange={({ helpers, state }) => {
        const text = helpers.getText({ state });
        return setVisual(text);
      }}
      classNames={[
        css`
          &.ProseMirror {
            padding: 0;
            pre {
              height: 100%;
              padding: ${getThemeVar('space', 3)};
              margin: 0;
            }
          }
        `,
      ]}
    />
  );
};

const VisualEditor = () => {
  const { visual, setMarkdown } = useDualEditor();

  return (
    <Remirror
      autoFocus
      manager={visual.manager}
      autoRender="end"
      onChange={({ helpers, state }) => setMarkdown(helpers.getMarkdown(state))}
      initialContent={visual.state}
      classNames={[
        css`
          &.ProseMirror {
            p,
            h3,
            h4 {
              margin-top: ${getThemeVar('space', 2)};
              margin-bottom: ${getThemeVar('space', 2)};
            }

            h1,
            h2 {
              margin-bottom: ${getThemeVar('space', 3)};
              margin-top: ${getThemeVar('space', 3)};
            }
          }
        `,
      ]}
    >
      <MarkdownToolbar />
    </Remirror>
  );
};

export const DualEditor: React.FC = () => {
  const visual = useRemirror({
    extensions,
    stringHandler: 'markdown',
    content: '**Markdown** content is the _best_',
  });

  const markdown = useRemirror({
    extensions: () => [
      new DocExtension({ content: 'codeBlock' }),
      new CodeBlockExtension({
        supportedLanguages: [md, typescript],
        defaultLanguage: 'markdown',
        syntaxTheme: 'base16_ateliersulphurpool_light',
        defaultWrap: true,
      }),
    ],
    builtin: {
      exitMarksOnArrowPress: false,
    },
    stringHandler: 'html',
  });

  return (
    <DualEditorProvider visual={visual} markdown={markdown}>
      <ThemeProvider>
        <VisualEditor />
        <MarkdownTextEditor />
      </ThemeProvider>
    </DualEditorProvider>
  );
};