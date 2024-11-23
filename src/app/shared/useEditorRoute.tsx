import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AppGlobals } from "../../globals";
import { generateId } from "./generateId";
import { getDocRoomConfig, roomConfigsByDocId } from "./store/doc-room-config";

export function useEditorRoute() {
  const params = useParams();
  let { docId } = params;

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const x = searchParams.get("x");
  const roomId = searchParams.get("roomId");
  const { frontmatter } = AppGlobals;
  // when docId, roomId or x changes, update password and encrypted
  useEffect(() => {

    if (roomId) {
      console.log('roomId effect')
      const config = getDocRoomConfig(docId!, roomId!);
      if (x) {
        const newSearchParams = Object.fromEntries(
          Array.from(searchParams.entries()).filter(([key]) => key !== "x")
        );
        newSearchParams.encrypt = 'true';
        const isNewDoc = !docId;
        if (isNewDoc) {
          docId = generateId();
        }
        console.log('setting config');
        config.set({
          ...config.get(),
          docId: docId,
          roomId: roomId,
          password: x,
          encrypt: true,
          enabled: true,
          accessLevel: "edit",
        });
        console.log('set config to', config.get())
        roomConfigsByDocId.setKey(docId!, config);
        if (isNewDoc) {
          navigate(`/edit/${docId}?roomId=${roomId}&encrypt=true"}`, {
            replace: true,
          });
        } else {
          setSearchParams(newSearchParams, { replace: true });
        }
        return;
      }
      console.log('setting config');
      config.set({
        ...config.get(),
        docId: docId,
        roomId: roomId,
        // password: "",
        encrypt: false,
        enabled: true,
        accessLevel: "edit",
      });
      console.log('set config to', config.get())
    }

  }, [docId, roomId, x]);
}
