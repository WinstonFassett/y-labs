import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { generateId } from "../shared/generateId";
import { roomKeys } from "../shared/store/doc-room-keys";
import { AppGlobals } from "../../globals";
import Editor from "./Editor";
import { useEditorRoute } from "../shared/useEditorRoute";

export function EditorRoute() {
  useEditorRoute()
  return <Editor className="h-full" />;
}
