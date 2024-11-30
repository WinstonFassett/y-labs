import { createHashRouter } from "react-router-dom";
import { NewAppDocRoute } from "../shared/NewAppDocRoute";
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

