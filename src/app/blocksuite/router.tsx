import { useEffect } from "react";
import { createHashRouter, useNavigate } from "react-router-dom";
import { generateId } from "../shared/generateId";
import { saveOfflineDoc } from "../shared/store/local-yjs-idb-offline";
import { EditorRoute } from "./EditorRoute";

export const routes = [
  {
    path: "/",
    element: <NewAppDocRoute />,
  },
  { path: "/new", element: <NewAppDocRoute /> },
  {
    path: "/edit/:docId",
    element: <EditorRoute />,
  },
];

export const router = createHashRouter(routes);


export function NewAppDocRoute() {
  const id = `blocksuite-${generateId()}`
  const navigate = useNavigate();  

  useEffect(() => {
    async function enablePersistence() {
      await saveOfflineDoc(id);
      navigate(`/edit/${id}`, { replace: true });
    }
    enablePersistence();
  }, []);

  return <div>Creating {id}...</div>;
}