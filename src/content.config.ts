import { defineCollection } from "astro:content";
import { z } from "astro:schema";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    /** Reading time in minutes, rounded. Written, not computed at runtime. */
    readingMinutes: z.number().int().positive(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
