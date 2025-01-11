import { effects as blocksEffects } from '@blocksuite/blocks/effects';
import { effects as presetsEffects } from '@blocksuite/presets/effects';

import '../../style.css';
import { setupEdgelessTemplate } from '../_common/setup.js';
import '../dev-format.js';
import { CollectionSetup } from './setupCollection.js';

blocksEffects();
presetsEffects();

async function setupEditor () {
  setupEdgelessTemplate();
  await CollectionSetup
  // return mountDefaultDocEditor(collection)
}

export const EditorSetup = setupEditor()