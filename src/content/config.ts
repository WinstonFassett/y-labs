import { z, defineCollection } from "astro:content";

const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    draft: z.boolean().optional(),
    pubDate: z.coerce.date().optional(),
    updatedDate: z.coerce.date().optional(),
    description: z.string().optional(),
    author: z.string().optional(),
    image: z
      .object({
        url: z.string(),
        alt: z.string(),
      })
      .optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const labs = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    url: z.string(),
    draft: z.boolean().optional(),
    pubDate: z.coerce.date().optional(),
    updatedDate: z.coerce.date().optional(),
    description: z.string().optional(),
    image: z
      .object({
        url: z.string(),
        alt: z.string(),
      })
      .optional(),
    tags: z.array(z.string()).optional(),
  }),
});

// Export a single `collections` object to register your collection(s)
export const collections = {
  posts,
  labs,
};
