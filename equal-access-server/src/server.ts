import express from 'express';
// import puppeteer from 'puppeteer';
import type { Report } from "./engine-types/v4/api/IReport";
import { Request, Response, NextFunction } from 'express';
import { aceCheck, initializePagePool, closePagePool } from './aceChecker';
import bodyParser from 'body-parser';
import * as puppeteer from 'puppeteer';

const app = express();
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));
const PORT = process.env.PORT || 3000;
const DEFAULT_ID = 'WCAG_2_1';
const DEFAULT_REPORT_LEVELS = ['violation', 'potentialviolation', 'manual'];

app.use(bodyParser.json());

let browser: puppeteer.Browser;

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

app.get('/', (_req, res) => {
  res.send('Hello, World!');
});

/**
 * The main scan endpoint that takes in the HTML content and the guideline IDs to scan against.
 * @param {string} html - The HTML content to scan.
 * @param {string | string[]} guidelineIds - The guideline IDs to scan against.
    * Can be: WCAG_2_1, WCAG_2_2, WCAG_2_0, IBM_Accessibility, IBM_Accessibility_Next
    * See the full list of guideline IDs at /ace-engine/src/v4/ruleset.ts
 * @returns {Object} - JSON response with statusCode and body containing the scan results.
 * @example
 * {
 * "html": "<!DOCTYPE html><html><head><title>Test</title></head><body>Hello World</body></html>",
 * "guidelineIds": ["WCAG_2_2"]
}
 */
app.post(
  "/scan",
  asyncHandler(async (req, res) => {
    try {
      console.log("🔍  /scan route called");
      const html: string = req.body.html;
      const guidelineIds: string | string[] =
        req.body.guidelineIds || DEFAULT_ID;
      const reportLevels: string | string[] =
        req.body.reportLevels || DEFAULT_REPORT_LEVELS;

      // Modified to match Lambda output format
      const report: Report = await aceCheck(
        html,
        browser,
        guidelineIds,
        reportLevels
      );
        // Modified to match Lambda output format
        res.status(200).json(report);
      } catch (err: any) {
        console.error("❌  /scan route error:", err);
        // console.log("req.body:", req.body);
        // console.log("res:", res);
        res.status(500).json({ error: err.message ?? "Unknown error" });
      }
    })
  );


app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

const ASYNC_POOL_SIZE = parseInt(process.env.ASYNC_POOL_SIZE || '5', 10);

(async () => {
  try {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    await initializePagePool(browser, ASYNC_POOL_SIZE);
    app.listen(PORT, () => {
    });
  } catch (err) {
    console.error("Error launching Puppeteer:", err);
    process.exit(1);
  }
})();

process.on('SIGINT', async () => {
  await closePagePool();
  if (browser) {
    await browser.close();
  }
  process.exit();
});
