import { useEffect, useState } from "react";

export function useTheme() {
  const initialTheme = (window as any).resolveTheme() as string;
  const [theme, setTheme] = useState(initialTheme);
  useEffect(() => {
    const onSetTheme = (event: any) => {
      const theme = event.detail;
      setTheme(theme);
    };
    document.addEventListener("set-theme", onSetTheme);
    return () => {
      document.removeEventListener("set-theme", onSetTheme);
    };
  }, []);
  return [theme, (window as any).setTheme as (theme: string) => void] as const;
}
