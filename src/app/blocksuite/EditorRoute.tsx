
import { useDocRoomRoute } from "../shared/useDocRoomRoute";
import BlockSuiteEditor from './BlockSuiteAppEditor'

export function EditorRoute() {
  useDocRoomRoute()
  return <BlockSuiteEditor />;
}
