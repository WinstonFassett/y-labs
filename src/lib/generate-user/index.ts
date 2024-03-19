import doUsername from "do_username";

export const generateUsername = doUsername.generate as (
  maxLength: number,
) => string;

export const usercolors = [
  "#30bced",
  "#6eeb83",
  "#ffbc42",
  "#ecd444",
  "#ee6352",
  "#9ac2c9",
  "#8acb88",
  "#1be7ff",
];
export const pickColor = () =>
  usercolors[Math.floor(Math.random() * usercolors.length)];

export const generateUser = (maxLength: number = 30) => {
  return {
    username: generateUsername(maxLength),
    color: pickColor(),
  };
};
