import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = process.env.BASE ?? "http://localhost:4321";
const OUT = ".impeccable/review";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844, mobile: true },
  { name: "tablet", width: 768, height: 1024, mobile: true },
  { name: "laptop", width: 1024, height: 800, mobile: false },
  { name: "desktop", width: 1440, height: 900, mobile: false },
  { name: "wide", width: 1920, height: 1080, mobile: false },
];

const ROUTES = process.env.ROUTES
  ? process.env.ROUTES.split(",")
  : ["/", "/blog/", "/privacidade/"];

const slug = (route) =>
  route === "/" ? "home" : route.replace(/^\/|\/$/g, "").replace(/\//g, "-");

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const problems = [];

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    locale: "pt-BR",
    reducedMotion: process.env.REDUCED === "1" ? "reduce" : "no-preference",
  });
  const page = await context.newPage();

  page.on("pageerror", (error) =>
    problems.push(`[${vp.name}] pageerror: ${error.message}`),
  );
  page.on("console", (message) => {
    if (message.type() === "error") {
      problems.push(`[${vp.name}] console: ${message.text()}`);
    }
  });

  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(700);

    // A full-page capture never scrolls, so the scroll-triggered reveal would
    // photograph every below-the-fold section at opacity 0. Settle it first.
    if (process.env.FULL === "1") {
      await page.evaluate(() => {
        document.documentElement.classList.remove("js-reveal");
        document
          .querySelectorAll("[data-reveal]")
          .forEach((el) => el.classList.add("is-revealed"));
      });
      await page.waitForTimeout(200);
    }

    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      const wide = [...document.querySelectorAll("body *")]
        .filter((el) => el.getBoundingClientRect().right > doc.clientWidth + 1)
        .slice(0, 4)
        .map((el) => `${el.tagName}.${el.className}`.slice(0, 90));
      return {
        scrollW: doc.scrollWidth,
        clientW: doc.clientWidth,
        offenders: wide,
      };
    });

    if (overflow.scrollW > overflow.clientW + 1) {
      problems.push(
        `[${vp.name}${route}] horizontal overflow ${overflow.scrollW} > ${overflow.clientW} :: ${overflow.offenders.join(" | ")}`,
      );
    }

    await page.screenshot({
      path: `${OUT}/${slug(route)}-${vp.name}.png`,
      fullPage: process.env.FULL === "1",
    });
  }

  await context.close();
}

await browser.close();

console.log(problems.length ? problems.join("\n") : "NO PROBLEMS FOUND");
