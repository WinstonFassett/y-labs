import { getCollection } from "astro:content";
export const getPosts = () =>
  getCollection("posts", ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  });
