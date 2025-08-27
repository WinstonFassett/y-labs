import {
  BlockFlavourIdentifier,
  BlockServiceIdentifier,
  type ExtensionType,
  StdIdentifier,
} from '@blocksuite/block-std';
import {
  AttachmentBlockService,
  EdgelessEditorBlockSpecs,
  PageEditorBlockSpecs,
} from '@blocksuite/blocks';

class CustomAttachmentBlockService extends AttachmentBlockService {
  override mounted(): void {
    super.mounted();
    this.maxFileSize = Infinity //  100 * 1000 * 1000; // 100MB
    console.log("CustomAttachmentBlockService mounted with maxFileSize =", this.maxFileSize);
  }
}

export const CustomAttachmentSpecSetup:ExtensionType = {
  setup: di => {
    di.override(
      BlockServiceIdentifier('affine:attachment'),
      CustomAttachmentBlockService,
      [StdIdentifier, BlockFlavourIdentifier('affine:attachment')]
    );
  },
}

export function getCustomAttachmentSpecs() {
  const pageModeSpecs: ExtensionType[] = [
    ...PageEditorBlockSpecs,
    {
      setup: di => {
        di.override(
          BlockServiceIdentifier('affine:attachment'),
          CustomAttachmentBlockService,
          [StdIdentifier, BlockFlavourIdentifier('affine:attachment')]
        );
      },
    },
  ];
  const edgelessModeSpecs: ExtensionType[] = [
    ...EdgelessEditorBlockSpecs,
    {
      setup: di => {
        di.override(
          BlockServiceIdentifier('affine:attachment'),
          CustomAttachmentBlockService,
          [StdIdentifier, BlockFlavourIdentifier('affine:attachment')]
        );
      },
    },
  ];

  return {
    pageModeSpecs,
    edgelessModeSpecs,
  };
}
