import { RouterProvider } from "react-router-dom";
import { AppGlobals } from "../../globals";
import Drive from "./Drive";

type Props = {
  frontmatter: {
    title: string;
  };
};

export default function App(props: Props) {
  Object.assign(AppGlobals, props);
  return <Drive />;
}
