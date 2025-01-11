import { collection } from "@/app/shared/store/blocksuite-docs";
import { AffineEditorContainer } from "@blocksuite/presets";
import { Doc, DocCollection } from "@blocksuite/store";

import {
  BlockServiceWatcher,
  EditorHost,
  type ExtensionType,
} from "@blocksuite/block-std";
import {
  AffineFormatBarWidget,
  CommunityCanvasTextFonts,
  DocModeExtension,
  DocModeProvider,
  FontConfigExtension,
  GenerateDocUrlExtension,
  NotificationExtension,
  OverrideThemeExtension,
  PageRootService,
  ParseDocUrlExtension,
  RefNodeSlotsExtension,
  RefNodeSlotsProvider,
  SpecProvider,
} from "@blocksuite/blocks";
import { effects as blocksEffects } from "@blocksuite/blocks/effects";
import { effects as presetsEffects } from "@blocksuite/presets/effects";
// import { AttachmentViewerPanel } from "./_common/components/attachment-viewer-panel";
import {
  mockDocModeService,
  mockGenerateDocUrlService,
  mockNotificationService,
  mockParseDocUrlService,
  // mockPeekViewExtension,
  themeExtension,
} from "./_common/mock-services";
import { initDoc } from "./initDoc";

blocksEffects();
presetsEffects();

export interface EditorContextType {
  editor: AffineEditorContainer | null;
  collection: DocCollection | null;
  updateCollection: (newCollection: DocCollection) => void;
}

export function createEditor(doc: Doc, mode: "edgeless" | "page" = "edgeless") {
  console.log("blocksuite/createEditor.ts:createEditor()");
  initDoc(doc);

  // const attachmentViewerPanel = new AttachmentViewerPanel();

  const editor = new AffineEditorContainer();
  editor.doc = doc;

  setupDebug();
  bindMode();
  setupEditorExtensions();
  setupDocLink();

  return { editor, collection };

  function setupDebug() {
    Object.assign(window, {
      editor,
      doc,
    });
    
    if (!globalThis.hasOwnProperty("host")) {
      Object.defineProperty(globalThis, "host", {
      get() {
        return document.querySelector<EditorHost>("editor-host");
      },
      });
    }
    if (!globalThis.hasOwnProperty("std")) {
      Object.defineProperty(globalThis, "std", {
      get() {
        return document.querySelector<EditorHost>("editor-host")?.std;
      },
      });
    }
  }

  function bindMode() {
    const modeService = editor.std.provider.get(DocModeProvider);
    editor.slots.docUpdated.on(({ newDocId }) => {
      console.log("doc updated", newDocId);
      editor.mode = modeService.getPrimaryMode(newDocId);
    });
  }

  function setupDocLink() {
    editor.std
      .get(RefNodeSlotsProvider)
      .docLinkClicked.on(({ pageId: docId }) => {
        console.log(`const target = collection.getDoc(docId);
      if (!target) {
        throw new Error(\`Failed to jump to doc ${docId}\`);
      }

      const url = editor.std
        .get(GenerateDocUrlProvider)
        .generateDocUrl(target.id);
      if (url) history.pushState({}, '', url);

      target.load();
      editor.doc = target;`);
      });
  }

  function setupEditorExtensions() {
    const refNodeSlotsExtension = RefNodeSlotsExtension();
    const setEditorModeCallBack = editor.switchEditor.bind(editor);
    const getEditorModeCallback = () => editor.mode;
    const extensions: ExtensionType[] = [
      refNodeSlotsExtension,
      PatchPageServiceWatcher,
      FontConfigExtension(CommunityCanvasTextFonts),
      // ParseDocUrlExtension(mockParseDocUrlService(collection)),
      // GenerateDocUrlExtension(mockGenerateDocUrlService(collection)),
      NotificationExtension(mockNotificationService(editor)),
      OverrideThemeExtension(themeExtension),
      DocModeExtension(
        mockDocModeService(getEditorModeCallback, setEditorModeCallBack),
      ),
      // mockPeekViewExtension(attachmentViewerPanel),
    ];

    const pageSpecs = SpecProvider.getInstance().getSpec("page");
    pageSpecs.extend([...extensions]);
    editor.pageSpecs = pageSpecs.value;

    const edgelessSpecs = SpecProvider.getInstance().getSpec("edgeless");
    edgelessSpecs.extend([...extensions]);
    editor.edgelessSpecs = edgelessSpecs.value;

    SpecProvider.getInstance().extendSpec("edgeless:preview", [
      OverrideThemeExtension(themeExtension),
    ]);
  }
}

class PatchPageServiceWatcher extends BlockServiceWatcher {
  static override readonly flavour = "affine:page";

  override mounted() {
    const pageRootService = this.blockService as PageRootService;
    const onFormatBarConnected = pageRootService.specSlots.widgetConnected.on(
      (view) => {
        if (view.component instanceof AffineFormatBarWidget) {
          console.log(`TODO: configureFormatBar(view.component);`);
        }
      },
    );
    pageRootService.disposables.add(onFormatBarConnected);
  }
}


