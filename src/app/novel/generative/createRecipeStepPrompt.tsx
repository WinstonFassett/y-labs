"use client";
function splitRecipeSteps(recipe: string, delimiter = "\n\n") {
  return recipe.split(delimiter).map((step) => step.trim());
}
export function parseRecipe(recipe: string) {
  const [prompt, ...steps] = splitRecipeSteps(recipe);
  return { prompt, steps };
}
export function createRecipeStepPrompt({
  prompt, steps, index, outputs,
}: {
  prompt: string;
  steps: string[];
  index: number;
  outputs: string[];
}) {
  const stepsCompleted = steps.slice(0, index);
  const stepsRemaining = steps.slice(index);
  return [
    {
      role: "system",
      content: `
      You are an automation that cannot talk back. Only complete the current step. Do not work ahead.
      
      Overall User Prompt: 
      ${prompt}

      ${steps.length} Planned Steps

      Steps Completed: ${stepsCompleted.length > 0 ? stepsCompleted.join("\n") : "none yet"}
      Last Step Output: ${outputs[index - 1] ?? "n/a"}
      `,
    },
    {
      role: "user",
      content: `Current Step Prompt: ${steps[index]}`,
    },
    {
      role: "assistant",
      content: "Output:",
    },
  ];
}
