import { chromium } from "playwright";

/** First-load transfer weight and field-metric proxies, at phone width. */
const BASE = process.env.BASE ?? "http://localhost:4321";
const ROUTE = process.env.ROUTE ?? "/";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

const byType = {};
let total = 0;
page.on("response", (response) => {
  const length = Number(response.headers()["content-length"] ?? 0);
  if (!length) return;
  const type = (response.headers()["content-type"] ?? "other").split(";")[0];
  byType[type] = (byType[type] ?? 0) + length;
  total += length;
});

await page.goto(BASE + ROUTE, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const lcp = await page.evaluate(
  () =>
    new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entry = list.getEntries().at(-1);
        resolve({
          ms: Math.round(entry.startTime),
          element: entry.element?.tagName ?? "?",
        });
      }).observe({ type: "largest-contentful-paint", buffered: true });
      setTimeout(() => resolve({ ms: null }), 3000);
    }),
);

const cls = await page.evaluate(
  () =>
    new Promise((resolve) => {
      let value = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) value += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
      setTimeout(() => resolve(Math.round(value * 1000) / 1000), 2000);
    }),
);

console.log(`first load of ${ROUTE} at 390px, cold cache:`);
for (const [type, bytes] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${(bytes / 1024).toFixed(0).padStart(6)} KB  ${type}`);
}
console.log(`  ${(total / 1024).toFixed(0).padStart(6)} KB  TOTAL`);
console.log(`LCP ${lcp.ms}ms (${lcp.element})   CLS ${cls}`);

await browser.close();
