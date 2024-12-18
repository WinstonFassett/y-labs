import { useEffect } from "react";
import { createHashRouter, useNavigate, useParams } from "react-router-dom";
import { generateId } from "../shared/generateId";
import { saveOfflineDoc } from "../shared/store/local-yjs-idb";
import { $newDocIds } from "../shared/store/new-doc-ids";
import { EditorRoute } from "./EditorRoute";
import { Workspace } from "./Workspace";

export const routes = [
  {
    path: "/",
    element: <Workspace />,
  },
  { path: "/new/:type", element: <NewWorkspaceDocRoute /> },
  {
    path: "/edit/:docId/:type",
    element: <EditorRoute />,
  },
  {
    path: "/versions/:docId/:type",
    element: <EditorRoute />,
  },
  {
    path: "/edit/:docId",
    element: <EditorRoute />,
  },
];

export const router = createHashRouter(routes);

function NewWorkspaceDocRoute() {
  const id = generateId();
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate()

  let typedId = type === 'blocksuite' ? `blocksuite-${id}` : id;

  useEffect(() => {
    async function enablePersistence() {
      $newDocIds.set(new Set($newDocIds.get().add(typedId)))
      await saveOfflineDoc(typedId)
      navigate(`/edit/${typedId}/${type}`, { replace: true })
    }
    enablePersistence();
  }, [])
  return <div>Creating {typedId}...</div>;
}
