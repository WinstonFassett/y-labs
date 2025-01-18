import { atom, map, onSet, computed } from "nanostores";
import secureLocalStorage from "react-secure-storage";

const KEY = "OPENAI_API_KEY";
export const $openaiApiKey = atom(
  secureLocalStorage.getItem(KEY) as string | undefined,
);

onSet($openaiApiKey, ({ newValue }) => {
  if (newValue) {
    secureLocalStorage.setItem(KEY, newValue);
  } else {
    secureLocalStorage.removeItem(KEY);
  }
});

export const $openaiApiKey_masked = computed($openaiApiKey, (openaiApiKey) => {
  if (typeof openaiApiKey !== "string" || openaiApiKey.length < 10) {
    return undefined;
  }
  const visiblePart = openaiApiKey.slice(0, 4);
  const maskedPart = "...";
  const endPart = openaiApiKey.slice(-4);
  return `${visiblePart}${maskedPart}${endPart}`;
});
