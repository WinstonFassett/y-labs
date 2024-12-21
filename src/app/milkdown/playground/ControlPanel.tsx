import { crepeAPI } from "./atom";
import { useLinkClass } from "./useLinkClass";
import clsx from "clsx";
import type { FC } from "react";
// import pkgJson from "../../../package.json";
import type { CodemirrorProps } from "./codemirror";
import { Codemirror } from "./codemirror";
import { useAtomValue } from "jotai";

interface ControlPanelProps extends CodemirrorProps {
  hide: boolean;
  setHide: (hide: boolean) => void;
}

const ControlPanel: FC<ControlPanelProps> = ({ hide, onChange, setHide }) => {
  const linkClass = useLinkClass();
  const { onShare } = useAtomValue(crepeAPI);

  if (hide) {
    return (
      <div className="fixed top-36 right-6 flex flex-col gap-2">
        <button
          onClick={() => {
            setHide(false);
            document.documentElement.scrollTop = 0;
          }}
          className={clsx(
            linkClass(false),
            "flex h-12 w-12 items-center justify-center rounded",
            "bg-nord6/70 dark:bg-nord3/70"
          )}
        >
          <span className="material-symbols-outlined text-2xl">
            chevron_left
          </span>
        </button>

        <button
          onClick={() => onShare()}
          className={clsx(
            linkClass(false),
            "flex h-12 w-12 items-center justify-center rounded",
            "bg-nord6/70 dark:bg-nord3/70"
          )}
        >
          <span className="material-symbols-outlined !text-base">share</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
     
      <Codemirror onChange={onChange} />
    </div>
  );
};

export default ControlPanel;
