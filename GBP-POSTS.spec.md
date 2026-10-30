# GBP-POSTS.spec.md — portable Google Business Profile summaries

A self-contained description of how to turn a long article into the short post
that goes on a Google Business Profile (the product formerly called Google My
Business; in the dashboard the surface is still "publicações" / "posts").

Written so it can be dropped onto another site without reading the rest of
this repository. The only project-specific parts are the article path, the
public origin, the voice, and the language. This repo's wiring is §13.

The post is a new text. It is not a truncation, not a paste of the opening
paragraph, and not something a build publishes on its own.

---

## 1. The idea in one paragraph

Each article gets a companion file whose body is the entire Google post. The
body is plain text, short enough to finish in under a minute, and **at most
1,500 characters**. The first sentence is the answer, because Search and Maps
show only the opening before "more". A button — for an article, "learn more" —
opens the full piece. The file is a publishing queue. It is not a page on the
site.

---

## 2. The hard limit, and the reading target

Google stores the post body in the `summary` field of a local post. The
composer rejects text over **1,500 characters**. That number is the contract.
The [REST reference](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.localPosts)
names the field and does not print the figure; the composer and the posting
tools that sit on the API enforce it. If a post is ever rejected below 1,500,
the composer wins and this spec gets updated.

The reading target for an article summary is **about 150–250 words**, which
in Portuguese usually lands between 900 and 1,400 characters. The character
cap wins when they conflict. Do not add a sentence just to reach 150 words,
and do not keep a sentence that pushes the paste over 1,500.

Count the paste, not the file:

1. Take the Markdown body, after the frontmatter.
2. Turn CRLF into LF.
3. Drop whitespace at both ends. Internal line breaks stay, and they count.
4. Measure UTF-16 code units (`String.length` in JavaScript). For Portuguese
   that matches the composer. An emoji can count as two; don't use emoji to
   spend the budget.

Stay at or under 1,400 while drafting, so a last edit still fits.

---

## 3. What you are producing

An **update** (`topicType: STANDARD` in the API): a description, an optional
photo, and one button. That is the right type for "we published an article".

The button label is chosen from Google's list. You do not write the label.
For an article the button is `learn_more`, which the Portuguese UI shows as
"Saiba mais". The URL is the canonical article, absolute, `https`.

| Editorial `cta` | API `ActionType` | Needs a URL |
| --- | --- | --- |
| `book` | `BOOK` | yes |
| `order` | `ORDER` | yes |
| `shop` | `SHOP` | yes |
| `learn_more` | `LEARN_MORE` | yes |
| `sign_up` | `SIGN_UP` | yes |
| `call` | `CALL` | no — Google uses the verified profile number |

Offers ignore `callToAction`. Google supplies the offer button. See §8.

Official lists: [Create posts](https://support.google.com/business/answer/7342169)
and the [posts API tutorial](https://developers.google.com/my-business/content/posts-data).

---

## 4. What this is not

- **Not a route.** Do not render the file as a page, do not put it in the
  sitemap, do not list it in `llms.txt` or any other crawlable index. The
  article is the public document. A second public copy competes with it and
  says less.
- **Not an API client.** The build checks the text. A person pastes it into
  the dashboard. A rejected or premature post would be public on Search and
  Maps, and Google reviews every post before it goes live.
- **Not a place for contact details.** The [content policy](https://support.google.com/business/answer/7213077)
  may remove a post that contains a phone number, an email, or a social
  handle, because those are not the verified profile fields. The Call button
  is the phone. The article URL is the link.
- **Not Markdown.** The composer pastes characters. `**bold**`, `# headings`,
  `[links](url)` and HTML show up literally. Line breaks are the only formatting
  that survives.

---

## 5. How to write it

Read the source article and answer one question: what should a person know
after twenty seconds that they did not know before?

Then write, in the project's public language and voice:

1. **First sentence: the answer.** A number, a decision, or the thing the
   article exists to say. If the reader never taps "more", that sentence
   still has to be true and useful.
2. **The few facts that change a decision.** Pull them from the article.
   Every figure, price, date, and named threshold has to appear in the
   source. If the article corrects itself, follow the correction — usually
   the itemized version, not the looser sentence in the introduction.
3. **One next step they can take without opening the article.** A test, three
   questions, a check before the busy month. The button is how they read the
   rest; the post should already have helped.
4. **Stop.** No second idea, no table of contents of the article, no "as we
   discussed above".

A hyphen at the start of a line is fine when the article is genuinely a list.
One list, short lines, each line a complete phrase.

Voice, for any project:

- Concrete. A customer in that trade would say it this way.
- No slogan that could sit on a competitor's post unchanged.
- No claim the article does not make. Uncertainty in the source stays
  uncertainty in the post. "There is no guaranteed method" survives the cut;
  a guarantee does not get invented on the way down.
- A hypothetical example may move to the city of the profile. A reported
  fact may not. "Write the service the way the customer searches for it" can
  use the profile's city. A price measured for another market cannot.
- Mention the business only where the article states its own number or
  method. The post is already published on the business's profile.

Do not pad, and do not keep a paragraph whose only job is to restate the
first sentence.

---

## 6. The file

One Markdown file per summary. The filename should be the source slug. A
second file for the same article is allowed when you are refreshing a post
that is already live; give it its own name and point `source` at the article.

```text
src/content/google/<source-slug>.md
```

The directory name can change. The frontmatter cannot, or the checker and
the person pasting will disagree.

```yaml
---
source: how-much-does-a-site-cost   # id of the article in the source collection
updatedAt: 2026-10-17               # when this summary was aligned with it
topic: update                       # update | event | offer
cta: learn_more                     # see §3; omit the URL when cta is call
ctaUrl: https://example.com/blog/how-much-does-a-site-cost/
status: ready                       # draft | ready | published
lang: en                            # BCP 47, the language of the body
# gbpPublishedAt: 2026-10-20        # required once status is published
# image: campaign/holiday.jpg       # a note for the person uploading
# imageAlt: Short description of that photo
---

The first sentence is the answer. Then the few facts that matter.

A blank line separates paragraphs. There is no URL in this text.
```

`status` is our queue, not Google's. After a paste, the dashboard shows its
own state: processing, live, or rejected. `published` here means "someone
pasted it". If Google rejects it, set the file back to `ready`, fix the
text, and paste again. Record `gbpPublishedAt` only for a paste that happened.

`image` is a reminder, not a build asset. The dashboard wants one photo the
composer accepts (JPEG or PNG; keep it under a few megabytes and at least a
few hundred pixels on the short side). A post without a photo is valid. Do
not block the text on a crop you do not have. Alt text is required in the
file when `image` is set, so the uploader knows what the picture is of.

---

## 7. Staying tied to the article

`source` must be the id of a real article. When that article changes a
number, a promise, or the answer, update the summary and bump `updatedAt`.
If the summary was already pasted, move `status` back to `ready` until
someone edits the live post or publishes a new one.

The checker warns — it does not fail the build — when the article's
`updatedAt` (or `publishedAt`, if it was never revised) is newer than the
summary. A typo fix in the article often changes nothing in the post. The
warning means "reread before pasting", not "rewrite automatically".

Do not generate the summary by deleting paragraphs until the counter fits.
The short text has its own shape (§5). Updating it is a writing job.

---

## 8. Events and offers

Article summaries are updates. The same file format covers the other two
types the dashboard still offers, so a project does not invent a second
schema the day it runs a promotion.

Both require an event block in the API: a title, a start, and an end.

```yaml
topic: event          # or offer
eventTitle: Open Saturday this month
startsAt: 2026-11-07
endsAt: 2026-11-07
```

Title and coupon code are capped here at **58 characters**. That is a
composer-safe ceiling: the REST reference names `event.title` and
`offer.couponCode` without a length, and posting tools reject longer values
around that point. Recheck if Google accepts a longer title; do not raise
the cap on a guess.

An offer may also carry:

```yaml
couponCode: OPEN-SAT
terms: One use per customer. Not combinable with other discounts.
redeemUrl: https://example.com/redeem
```

`terms` is capped at the same 1,500 characters as the summary. That cap is
ours, so the fine print cannot be longer than the post. Google stores it in
`termsConditions`, separate from `summary`.

Offers do not use `cta` / `ctaUrl`. Leave the button URL out. `redeemUrl`
maps to `offer.redeemOnlineUrl`.

Dates in the file are calendar dates. The dashboard also asks for a time;
enter the real hours when pasting. Do not invent a countdown.

Alerts (`COVID_19` and anything Google adds later) are out of this contract.
They are not a general publishing format.

---

## 9. Publishing by hand

When `status` is `ready` and the checker is clean:

1. Open the Business Profile and create an update (or the event / offer).
2. Paste **the body only**. Not the frontmatter.
3. Set the button from `cta` and the URL from `ctaUrl`. Confirm the URL
   opens the article.
4. Add the photo if `image` names one.
5. Submit. Google reviews the post before it is public.
6. Set `status: published` and `gbpPublishedAt` to that day.

The build never calls the API. Campaign parameters, if you want the click
distinguishable in analytics, are added at paste time. The file keeps the
clean canonical URL so the next edit does not fight a campaign string.

A standard update does not stay at the top of the profile forever. Google
has long retired them after a period of months; the help article in §3 is
the source of truth for the current window. Republish only after rereading
the summary against the article.

---

## 10. Validation

Two layers, so a bad paste fails before anyone opens the dashboard.

**Schema** (frontmatter): required `source` and `updatedAt`; `topic`, `cta`,
`status`, and `lang` from the lists in this spec; `ctaUrl` required for every
button except Call, forbidden on Call and on offers, and always `https`;
`gbpPublishedAt` required when `status` is `published`; event title, start,
and end required for events and offers; `imageAlt` required when `image` is
set; `endsAt` not before `startsAt`.

**Body** (the paste): under or equal to 1,500 characters by the count in §2;
not empty; no Markdown emphasis, headings, or links; no `http` URL; no HTML;
no email address; no `@handle`.

The word band is printed. It does not fail the build.

Reference implementation, meant to be copied:

```text
src/data/google-posts.ts          the numbers, the enums, the counter
scripts/check-google-posts.ts     reads the files and exits 1 on a hard failure
```

Wire the script in front of the production build, not only as a manual
command. A summary that cannot be pasted should not ship inside a deploy
that otherwise looks green.

At the top of the script, three knobs for the next project:

```ts
const ARTICLE_BASE = "/blog/";     // path prefix of the source articles
const REQUIRE_ARTICLE_URL = true; // false if the button should not open the article
```

The origin comes from that project's canonical site URL, not from a string
typed a second time in the checker.

---

## 11. Dropping this onto another project

1. Copy this file, `src/data/google-posts.ts`, and `scripts/check-google-posts.ts`.
2. Point the script's two directories at the article collection and the new
   `google` collection. Set `ARTICLE_BASE` and `REQUIRE_ARTICLE_URL`.
3. Add the collection. On Astro this is a `defineCollection` with the schema
   in §10 over `src/content/google/**/*.md`. Any other generator can keep the
   same files and run the same script; the schema is the contract, Astro is
   just the checker this repo uses.
4. Do not add a route.
5. Write one summary per article you actually want on the profile. An old
   article with nothing left to say does not need a post.
6. Run the checker. Paste by hand (§9).

Language, voice, and the article URL prefix are the only things that should
change. The 1,500-character cap, the plain-text body, the button list, and
the "not a page" rule should not.

---

## 12. Definition of done for one summary

- The first sentence still helps if nobody opens the rest.
- A figure in the post can be found in the source article.
- The checker reports a character count at or under 1,500 and no body errors.
- `ctaUrl` opens the article (or `REQUIRE_ARTICLE_URL` was turned off on purpose).
- The file is not linked from any public page, sitemap, or `llms.txt`.
- Nothing in the build talks to Google.

---

## 13. This repository

| | |
| --- | --- |
| Spec | `GBP-POSTS.spec.md` |
| Summaries | `src/content/google/<blog-slug>.md` |
| Source articles | `src/content/blog/<slug>.md` |
| Limits and counter | `src/data/google-posts.ts` |
| Checker | `npm run check:google` (also runs before `npm run build` and inside `npm run check`) |
| Origin | `SITE_URL` in `src/data/site.ts` |
| Article URL | `https://plopsites.com.br/blog/<slug>/` |
| Language | `pt-BR` |
| Button | `learn_more` |
| Queue today | `ready` — written, not yet pasted |

Voice is the site's: Brazilian Portuguese, direct, no agency slogan, and
never `pequenos negócios`, `pequenas empresas`, or `negócio pequeno`. The
audience term, when one is needed, is `negócios independentes` or the person
who runs the business. Details live in `AGENTS.md` §13.

`AGENTS.md` §18 and `SEO.md` §12 point here so a later change does not turn
these files into pages.

When the summary rules change, update this file and `src/data/google-posts.ts`
in the same change. The checker imports that module; the numbers should not
be copied into the script.
