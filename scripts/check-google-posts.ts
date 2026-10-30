/**
 * Fails the build when a Google Business Profile summary breaks the contract
 * in `GBP-POSTS.spec.md`. Warnings (word band, a newer source article) print
 * and still exit 0: a complete short post is better than one padded to a count.
 *
 * Another project: change ARTICLE_BASE, point the two directories at its
 * collections, and set REQUIRE_ARTICLE_URL to false if the button should not
 * open the source article.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SITE_URL } from "../src/data/site.ts";
import {
  articleCtaUrl,
  GBP_SUMMARY_TARGET,
  GOOGLE_CTAS,
  GOOGLE_STATUSES,
  GOOGLE_TOPICS,
  inspectSummary,
  type GoogleCta,
  type GoogleStatus,
  type GoogleTopic,
} from "../src/data/google-posts.ts";

const ARTICLE_BASE = "/blog/";
const REQUIRE_ARTICLE_URL = true;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const googleDir = path.join(root, "src", "content", "google");
const blogDir = path.join(root, "src", "content", "blog");

const field = (frontmatter: string, key: string): string | undefined => {
  const match = frontmatter.match(new RegExp(`^${key}:[ \\t]*(.*)$`, "m"));
  if (!match) return undefined;
  const value = match[1].trim().replace(/^["']|["']$/g, "");
  return value.length > 0 ? value : undefined;
};

const splitFile = (
  raw: string,
): { frontmatter: string; body: string } | undefined => {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return undefined;
  return { frontmatter: match[1], body: match[2] };
};

const asTopic = (value: string | undefined): GoogleTopic | undefined =>
  GOOGLE_TOPICS.find((topic) => topic === value);

const asCta = (value: string | undefined): GoogleCta | undefined =>
  GOOGLE_CTAS.find((cta) => cta === value);

const asStatus = (value: string | undefined): GoogleStatus | undefined =>
  GOOGLE_STATUSES.find((status) => status === value);

const day = (value: string): string => value.slice(0, 10);

const files = (await readdir(googleDir)).filter((name) => name.endsWith(".md")).sort();
const errors: string[] = [];
const warnings: string[] = [];
const sources = new Map<string, string[]>();

if (files.length === 0) errors.push("src/content/google has no posts");

for (const name of files) {
  const raw = await readFile(path.join(googleDir, name), "utf8");
  const parts = splitFile(raw);
  if (!parts) {
    errors.push(`${name}: missing frontmatter`);
    continue;
  }

  const source = field(parts.frontmatter, "source");
  const topic = asTopic(field(parts.frontmatter, "topic") ?? "update");
  const cta = asCta(field(parts.frontmatter, "cta") ?? "learn_more");
  const status = asStatus(field(parts.frontmatter, "status") ?? "ready");
  const ctaUrl = field(parts.frontmatter, "ctaUrl");
  const updatedAt = field(parts.frontmatter, "updatedAt");
  const where = name;

  if (!source) errors.push(`${where}: source is required`);
  if (!topic) errors.push(`${where}: topic is not update, event, or offer`);
  if (!cta) errors.push(`${where}: cta is not a Google button`);
  if (!status) errors.push(`${where}: status is not draft, ready, or published`);
  if (!updatedAt) errors.push(`${where}: updatedAt is required`);

  if (source) {
    const peers = sources.get(source) ?? [];
    peers.push(name);
    sources.set(source, peers);
  }

  const inspection = inspectSummary(parts.body);
  for (const problem of inspection.problems) errors.push(`${where}: ${problem}`);

  const mark =
    inspection.problems.length > 0 || !source || !topic || !cta || !status
      ? "FAIL"
      : "ok  ";
  console.log(
    `${mark}  ${String(inspection.length).padStart(4)}c  ${String(inspection.words).padStart(3)}w  ${name}`,
  );

  if (inspection.problems.length > 0 || !topic || !cta) continue;

  if (
    inspection.words < GBP_SUMMARY_TARGET.minWords ||
    inspection.words > GBP_SUMMARY_TARGET.maxWords
  ) {
    warnings.push(
      `${where}: ${inspection.words} words; the reading target is ${GBP_SUMMARY_TARGET.minWords}–${GBP_SUMMARY_TARGET.maxWords}. The character cap still wins, so don't pad.`,
    );
  }

  if (topic === "offer" || cta === "call") {
    if (ctaUrl) errors.push(`${where}: this post has no button URL`);
  } else if (!ctaUrl) {
    errors.push(`${where}: ctaUrl is required`);
  } else if (!ctaUrl.startsWith("https://")) {
    errors.push(`${where}: ctaUrl has to be https`);
  }

  if (source && topic === "update" && cta === "learn_more" && REQUIRE_ARTICLE_URL && ctaUrl) {
    const expected = articleCtaUrl(SITE_URL, ARTICLE_BASE, source);
    if (ctaUrl !== expected) {
      errors.push(`${where}: ctaUrl should be ${expected}`);
    }
  }

  if (!source || !updatedAt) continue;

  const articlePath = path.join(blogDir, `${source}.md`);
  const articleRaw = await readFile(articlePath, "utf8").catch(() => undefined);
  if (!articleRaw) {
    errors.push(`${where}: no source article at src/content/blog/${source}.md`);
    continue;
  }

  const article = splitFile(articleRaw);
  if (!article) {
    errors.push(`${where}: source article has no frontmatter`);
    continue;
  }

  const articleStamp = field(article.frontmatter, "updatedAt") ?? field(article.frontmatter, "publishedAt");
  if (articleStamp && day(articleStamp) > day(updatedAt)) {
    warnings.push(
      `${where}: the article is dated ${day(articleStamp)}, the summary ${day(updatedAt)}. Reread it before pasting.`,
    );
  }

  if (field(article.frontmatter, "draft") === "true" && status !== "draft") {
    warnings.push(`${where}: the source article is still a draft`);
  }
}

for (const [source, names] of sources) {
  if (names.length > 1) {
    warnings.push(`${source}: ${names.length} summaries (${names.join(", ")}). Expected while refreshing a post.`);
  }
}

for (const warning of warnings) console.log(`warn  ${warning}`);

if (errors.length > 0) {
  for (const error of errors) console.error(`error ${error}`);
  process.exit(1);
}
