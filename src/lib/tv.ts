import { twMerge } from "tailwind-merge";
import { cva } from "class-variance-authority";
import {
  ClassProp,
  ClassValue,
  StringToBoolean,
} from "class-variance-authority/dist/types";

type ConfigSchema = Record<string, Record<string, ClassValue>>;

type ConfigVariants<T extends ConfigSchema> = {
  [Variant in keyof T]?: StringToBoolean<keyof T[Variant]> | null | undefined;
};
type ConfigVariantsMulti<T extends ConfigSchema> = {
  [Variant in keyof T]?:
    | StringToBoolean<keyof T[Variant]>
    | StringToBoolean<keyof T[Variant]>[]
    | undefined;
};

type Config<T> = T extends ConfigSchema
  ? {
      variants?: T;
      defaultVariants?: ConfigVariants<T>;
      compoundVariants?: (T extends ConfigSchema
        ? (ConfigVariants<T> | ConfigVariantsMulti<T>) & ClassProp
        : ClassProp)[];
    }
  : never;

type Props<T> = T extends ConfigSchema
  ? ConfigVariants<T> & ClassProp
  : ClassProp;

export type TvaConfig<T> = { base?: ClassValue } & Config<T>;

export const tva =
  <T extends ConfigSchema>({ base, ...config }: TvaConfig<T>) =>
  (props?: Props<T>) =>
    twMerge(cva<T>(base, config as Config<T>)(props));
