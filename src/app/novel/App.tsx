import { RouterProvider } from "react-router-dom";
import { AppGlobals } from "../../globals";
import { router } from "./router";
import "./styles/prosemirror.css";
import { SettingsDialog } from "../shared/SettingsDialog";

type Props = {
  frontmatter: {
    title: string;
  };
};

export default function App(props: Props) {
  Object.assign(AppGlobals, props);
  return (
    <div>
      <RouterProvider router={router} />
      <SettingsDialog />
    </div>
  );
}
