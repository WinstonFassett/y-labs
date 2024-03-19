import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { generateId } from "../shared/generateId";
import { roomKeys } from "../shared/store/doc-room-keys";
import Editor from "./Tldraw";

export function EditorRoute() {
  const params = useParams();
  let { docId } = params;

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const x = searchParams.get("x");
  const roomId = searchParams.get("roomId");
  const encrypt = searchParams.has("encrypt");

  // when docId, roomId or x changes, update password and encrypted
  useEffect(() => {
    if (x) {
      const newSearchParams = Object.fromEntries(
        Array.from(searchParams.entries()).filter(([key]) => key !== "x"),
      );
      const isNewDoc = !docId;
      if (isNewDoc) {
        docId = generateId();
      }
      roomKeys.setKey(docId!, x);
      if (isNewDoc) {
        navigate(
          `/edit/${docId}?roomId=${roomId}${x || encrypt ? "&encrypt" : ""}`,
          { replace: true },
        );
      } else {
        setSearchParams(newSearchParams, { replace: true });
      }
    }
  }, [docId, roomId, x]);

  return <Editor className="h-full" />;
}
