import { Navigate, createHashRouter, useNavigate, useParams } from "react-router-dom";
import { EditorRoute } from "./EditorRoute";
import { generateId } from "../shared/generateId";
import { Workspace } from "./Workspace";
import { getDocIdbStore, saveOfflineDoc } from "../shared/store/local-yjs-idb";
import { allTasks } from 'nanostores'
import { useStore } from "@nanostores/react";
import { useEffect, useState, Suspense } from "react";

export const routes = [
  {
    path: "/",
    element: <Workspace />,
  },
  { path: "/new/:type", element: <NewDocRoute /> },
  {
    path: "/edit/:docId/:type",
    element: <EditorRoute />,
  },
  {
    path: "/edit/:docId",
    element: <EditorRoute />,
  },
];

export const router = createHashRouter(routes);

function NewDocRoute() {
  const id = generateId();
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate()

  useEffect(() => {
    async function enablePersistence() {
      await saveOfflineDoc(id)
      navigate(`/edit/${id}/${type}`, { replace: true })
    }
    enablePersistence();
  }, [])
  
  return <div>Creating {id}...</div>;
}
