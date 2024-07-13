import { atom, map, onSet } from "nanostores";
import secureLocalStorage from "react-secure-storage";

const KEY = "OPENAI_API_KEY";
export const $openaiApiKey = atom(
  secureLocalStorage.getItem(KEY) as string | undefined,
);

onSet($openaiApiKey, (value) => {
  secureLocalStorage.setItem(KEY, value);
});
