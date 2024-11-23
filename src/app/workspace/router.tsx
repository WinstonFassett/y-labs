import { Navigate, createHashRouter } from "react-router-dom";
import { EditorRoute } from "./EditorRoute";
import { generateId } from "../shared/generateId";
import { createHashRouter } from "react-router-dom";
import { Workspace } from "./Workspace";

export const routes = [
  {
    path: "/",
    element: <NewDocRoute />,
  },
  { path: "/new", element: <NewDocRoute /> },
  {
    path: "/edit/:docId",
    element: <EditorRoute />,
  },
];

export const router = createHashRouter(routes);

function NewDocRoute() {
  const id = generateId();
  return <Navigate to={`/edit/${id}`} replace />;
}
