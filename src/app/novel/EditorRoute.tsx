import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { AppGlobals } from "../../globals";
import { generateId } from "../shared/generateId";
import Editor from "./editor";
import { roomKeys } from "../shared/store/doc-room-keys";
import AppBar from "../shared/AppBar";

export function EditorRoute() {
  const params = useParams();
  let { docId } = params;

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const x = searchParams.get("x");
  const roomId = searchParams.get("roomId");
  // const encrypt = searchParams.has("encrypt");
  const { frontmatter } = AppGlobals;
  console.log({ roomId, docId, x, searchParams });
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
      console.log("setKey", docId, x);
      if (isNewDoc) {
        console.log("redirect to new doc", newSearchParams);
        navigate(`/edit/${docId}?roomId=${roomId}"}`, {
          replace: true,
        });
      } else {
        console.log("setSearch params", newSearchParams);
        setSearchParams(newSearchParams, { replace: true });
      }
    }
  }, [docId, roomId, x]);

  return <Editor />;
}
