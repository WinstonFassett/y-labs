import { Navigate, createHashRouter, useParams } from "react-router-dom";
import { EditorRoute } from "./EditorRoute";
import { generateId } from "../shared/generateId";
import { Workspace } from "./Workspace";

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
  return <Navigate to={`/edit/${id}/${type}`} replace />;
}
