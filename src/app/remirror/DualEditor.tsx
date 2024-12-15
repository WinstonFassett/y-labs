// DualEditor.tsx
import '@remirror/styles/all.css';
import { css } from '@emotion/css';
import { createContextState } from 'create-context-state';
import React, { useMemo } from 'react';
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
import { Doc } from 'yjs';
import { YjsExtension } from './yjs-extension'
//'@remirror/extension-yjs';
import { useDocEditor } from '../shared/useDocEditor';
import { Awareness } from 'y-protocols/awareness';
import './style.css'
const baseExtensions = () => [
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
  visual: UseRemirrorReturn<ReactExtensions<ReturnType<typeof baseExtensions>[number]>>;
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
        'flex-1',
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

/**
 * yjs typings are very rough; so we define here the interface that we require
 * (y-webrtc and y-websocket providers are both compatible with this interface;
 * no other providers have been checked).
 */
interface YjsRealtimeProvider {
  doc: Doc;
  awareness: any;
  destroy: () => void;
  disconnect: () => void;
}

export const DualEditor: React.FC = () => {
  const { currentDoc, provider, docEditorKey } = useDocEditor();
  const realtime = useMemo(() => {
    return {
      extensions: () => [new YjsExtension({
        getProvider: () => ({
          doc: currentDoc,
          awareness: provider?.awareness ?? new Awareness(currentDoc),
          disconnect: () => provider?.disconnect(),
          destroy: () => provider?.destroy(),
        }),
      })],
    }
  }, [
    currentDoc, provider
  ])
  // TODO: factor in yjs, factor out other intermediate state
  // const { manager } = useRemirror({
  //   extensions: () => [new YjsExtension({ getProvider })],
  //   core: {
  //     excludeExtensions: ['history'],
  //   },
  // });
  // Alternatively you can also disable the "undo"/"redo" functionality of the yjs extension:
  // const { manager } = useRemirror({
  //   extensions: () => [new YjsExtension({ getProvider, disableUndo: true })],
  // });
  const extensions = useMemo(() => [...baseExtensions(), ...realtime.extensions()], [realtime]);
  console.log({ extensions })
  const visual = useRemirror({
    extensions,
    stringHandler: 'markdown',
    // content: '**Markdown** content is the _best_',
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
      // ...realtime.extensions(),
    ],
    builtin: {
      exitMarksOnArrowPress: false,
    },
    stringHandler: 'html',
  });

  return (
    <DualEditorProvider key={docEditorKey} visual={visual} markdown={markdown}>
      <ThemeProvider>
        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
          <div className="w-full flex flex-col sm:w-1/2 border-b sm:border-b-0 sm:border-r border-gray-300">
            <VisualEditor />
          </div>
          <div className="w-full flex flex-col sm:w-1/2 pt-8">
            <MarkdownTextEditor />
          </div>
        </div>
      </ThemeProvider>
    </DualEditorProvider>
  );
};