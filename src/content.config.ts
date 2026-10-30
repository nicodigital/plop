import { defineCollection } from "astro:content";
import { z } from "astro:schema";
import { glob } from "astro/loaders";
import { BLOG_CATEGORY_KEYS } from "./data/blog.ts";
import {
  GBP_SHORT_FIELD_MAX,
  GBP_SUMMARY_MAX,
  GOOGLE_CTAS,
  GOOGLE_STATUSES,
  GOOGLE_TOPICS,
} from "./data/google-posts.ts";

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

/**
 * Summaries for the Google Business Profile dashboard. Not pages: nothing
 * routes this collection, and it stays out of the sitemap and `llms.txt`.
 * The body rules are enforced by `scripts/check-google-posts.ts`.
 */
const google = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/google" }),
  schema: z
    .object({
      /** Slug of the source article in `src/content/blog`. */
      source: z.string().min(1),
      /** When this summary was last aligned with that article. */
      updatedAt: z.coerce.date(),
      topic: z.enum(GOOGLE_TOPICS).default("update"),
      cta: z.enum(GOOGLE_CTAS).default("learn_more"),
      /** Absolute https URL. Omitted for `call`, and ignored by Google on offers. */
      ctaUrl: z.string().url().optional(),
      status: z.enum(GOOGLE_STATUSES).default("ready"),
      /** Set when the text is actually pasted into the dashboard. */
      gbpPublishedAt: z.coerce.date().optional(),
      lang: z.string().min(2).default("pt-BR"),
      /** Note for whoever uploads the photo. Not an Astro asset. */
      image: z.string().optional(),
      imageAlt: z.string().optional(),
      eventTitle: z.string().max(GBP_SHORT_FIELD_MAX).optional(),
      startsAt: z.coerce.date().optional(),
      endsAt: z.coerce.date().optional(),
      couponCode: z.string().max(GBP_SHORT_FIELD_MAX).optional(),
      /** Offer fine print. Capped like the summary; Google stores it separately. */
      terms: z.string().max(GBP_SUMMARY_MAX).optional(),
      redeemUrl: z.string().url().optional(),
    })
    .strict()
    .superRefine((data, ctx) => {
      const needsButtonUrl = data.topic !== "offer" && data.cta !== "call";
      if (needsButtonUrl && data.ctaUrl === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["ctaUrl"],
          message: "ctaUrl is required unless the button is Call or the post is an offer",
        });
      }
      if (!needsButtonUrl && data.ctaUrl !== undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["ctaUrl"],
          message: "Call posts and offers do not take a button URL",
        });
      }
      if (data.ctaUrl !== undefined && !data.ctaUrl.startsWith("https://")) {
        ctx.addIssue({
          code: "custom",
          path: ["ctaUrl"],
          message: "ctaUrl has to be https",
        });
      }
      if (data.status === "published" && data.gbpPublishedAt === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["gbpPublishedAt"],
          message: "A published post needs gbpPublishedAt",
        });
      }
      if (data.image !== undefined && data.imageAlt === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["imageAlt"],
          message: "An image needs imageAlt",
        });
      }
      if (data.topic === "event" || data.topic === "offer") {
        for (const key of ["eventTitle", "startsAt", "endsAt"] as const) {
          if (data[key] === undefined) {
            ctx.addIssue({
              code: "custom",
              path: [key],
              message: `${data.topic} posts need ${key}`,
            });
          }
        }
      }
      if (
        data.startsAt !== undefined &&
        data.endsAt !== undefined &&
        data.endsAt < data.startsAt
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["endsAt"],
          message: "endsAt is before startsAt",
        });
      }
    }),
});

export const collections = { blog, legal, google };
