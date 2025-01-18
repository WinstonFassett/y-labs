import { generateUser } from "@/lib/generate-user";
import { map } from "nanostores";

export const $user = map(generateUser());
