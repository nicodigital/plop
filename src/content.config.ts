import { defineCollection } from "astro:content";
import { z } from "astro:schema";
import { glob } from "astro/loaders";
import { BLOG_CATEGORY_KEYS } from "./data/blog.ts";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      /** Reading time in minutes, rounded. Written, not computed at runtime. */
      readingMinutes: z.number().int().positive(),
      draft: z.boolean().default(false),
      /** Badge on the card and pill on the article. Labels in data/blog.ts. */
      category: z.enum(BLOG_CATEGORY_KEYS),
      /** Cover master. astro:assets derives the card and article widths. */
      cover: image(),
      coverAlt: z.string(),
    }),
});

/**
 * Legal copy lives in the collection rather than inside the page so the text
 * has one source: the rendered page and its `.md` sibling are the same body,
 * and a clause can never be updated in one and forgotten in the other.
 */
const legal = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/legal" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    updatedAt: z.coerce.date(),
  }),
});

export const collections = { blog, legal };
