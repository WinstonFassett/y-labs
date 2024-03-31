import { RouterProvider } from "react-router-dom";
import { AppGlobals } from "../../globals";
import { router } from "./router";
import "./styles/prosemirror.css";
import "./styles/globals.css";

type Props = {
  frontmatter: {
    title: string;
  };
};

export default function App(props: Props) {
  Object.assign(AppGlobals, props);
  return <RouterProvider router={router} />;
}
