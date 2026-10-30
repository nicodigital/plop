/**
 * Contract for Google Business Profile summaries.
 *
 * The dashboard calls these "publicações" / posts. The API calls the body
 * `summary` and the ordinary post `STANDARD`. Limits and the paste rules live
 * here so the content schema and `scripts/check-google-posts.ts` cannot drift.
 * The portable description is `GBP-POSTS.spec.md`.
 */

/** Hard cap of the post body. The composer rejects anything longer. */
export const GBP_SUMMARY_MAX = 1500;

/**
 * Safe ceiling for an event title and a coupon code. The REST reference names
 * the fields and does not print a number; posting tools reject longer values,
 * commonly at 58. Staying under it is conservative.
 */
export const GBP_SHORT_FIELD_MAX = 58;

/**
 * Reading target for an article summary. Guidance for the author, not a second
 * cap: a complete post under the word floor is better than one padded to hit
 * it, and the character cap always wins.
 */
export const GBP_SUMMARY_TARGET = {
  minWords: 150,
  maxWords: 250,
  minChars: 900,
  maxChars: 1400,
} as const;

/** Editorial topic → API `LocalPostTopicType`. Alerts are not part of this contract. */
export const GOOGLE_TOPIC_API = {
  update: "STANDARD",
  event: "EVENT",
  offer: "OFFER",
} as const;

export const GOOGLE_TOPICS = ["update", "event", "offer"] as const;

/** Editorial button → API `ActionType`. The label on screen is Google's, not ours. */
export const GOOGLE_CTA_API = {
  book: "BOOK",
  order: "ORDER",
  shop: "SHOP",
  learn_more: "LEARN_MORE",
  sign_up: "SIGN_UP",
  call: "CALL",
} as const;

export const GOOGLE_CTAS = [
  "book",
  "order",
  "shop",
  "learn_more",
  "sign_up",
  "call",
] as const;

/** Our queue. Google's own state (LIVE, PROCESSING, REJECTED) is not this field. */
export const GOOGLE_STATUSES = ["draft", "ready", "published"] as const;

export type GoogleTopic = (typeof GOOGLE_TOPICS)[number];
export type GoogleCta = (typeof GOOGLE_CTAS)[number];
export type GoogleStatus = (typeof GOOGLE_STATUSES)[number];

/**
 * Absolute URL of the source article. `articleBase` is the path prefix of
 * that project's articles (`/blog/` here), with or without a trailing slash.
 */
export const articleCtaUrl = (
  origin: string,
  articleBase: string,
  slug: string,
): string => {
  const base = articleBase.startsWith("/") ? articleBase : `/${articleBase}`;
  const prefix = base.endsWith("/") ? base : `${base}/`;
  return new URL(`${prefix}${slug}/`, origin).href;
};

/**
 * The text that gets pasted. CRLF becomes LF, and whitespace around the body
 * is dropped. Internal line breaks stay, and they count.
 *
 * The length is UTF-16 code units (`String.length`). For Portuguese that is
 * the same number the composer shows. An emoji can count as two; these posts
 * don't use them.
 */
export const summaryText = (raw: string): string => raw.replace(/\r\n/g, "\n").trim();

export const summaryWordCount = (text: string): number =>
  text.split(/\s+/).filter((word) => word.length > 0).length;

const BODY_PROBLEMS: ReadonlyArray<{ pattern: RegExp; reason: string }> = [
  { pattern: /\*\*/, reason: "Markdown bold would be pasted with the asterisks" },
  { pattern: /^#{1,6} /m, reason: "A Markdown heading would be pasted with the hashes" },
  { pattern: /\]\(/, reason: "A Markdown link would be pasted with the brackets" },
  { pattern: /https?:\/\//i, reason: "A URL belongs on the button, not in the text" },
  { pattern: /<\/?[a-z][^>]*>/i, reason: "HTML is not rendered in the post" },
  {
    pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
    reason: "An email in the text can get the post removed",
  },
  {
    pattern: /(^|\s)@[A-Za-z0-9_.]+/,
    reason: "A social handle in the text can get the post removed",
  },
];

export type SummaryInspection = {
  text: string;
  length: number;
  words: number;
  problems: string[];
};

/** Hard failures for the body. The word band is reported by the checker, not here. */
export const inspectSummary = (raw: string): SummaryInspection => {
  const text = summaryText(raw);
  const problems: string[] = [];

  if (text.length === 0) problems.push("The summary is empty");
  if (text.length > GBP_SUMMARY_MAX) {
    problems.push(
      `The summary has ${text.length} characters; the maximum is ${GBP_SUMMARY_MAX}`,
    );
  }

  for (const rule of BODY_PROBLEMS) {
    if (rule.pattern.test(text)) problems.push(rule.reason);
  }

  return {
    text,
    length: text.length,
    words: summaryWordCount(text),
    problems,
  };
};
