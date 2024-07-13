import { atom, computed, onMount, task } from "nanostores";
import OpenAI from "openai";
import { $openaiApiKey } from "./secure-settings";

export const $session = computed([$openaiApiKey], (openaiApiKey) => {
  if (openaiApiKey) {
    const openai = connectToOpenAi(openaiApiKey);

    return openai;
  }
});

export const $engines = computed([$session], (session) => {
  return task(() => session?.models.list());
});

export const $openAiConfigValid = computed([$engines], (engines) => {
  return !!engines;
});

export function connectToOpenAi(openaiApiKey: string) {
  return new OpenAI({
    dangerouslyAllowBrowser: true,
    apiKey: openaiApiKey,
  });
}

export async function validateOpenAiKey(apiKey: string) {
  const openai = connectToOpenAi(apiKey);
  try {
    const models = await openai.models.list();
    console.log("models", models);
    return !!models;
  } catch (err) {
    console.log("failed to connect", err);
  }
  return false;
}
