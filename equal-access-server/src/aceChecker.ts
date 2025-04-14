import type { Report } from "./engine-types/v4/api/IReport";
import type { Issue } from "./engine-types/v4/api/IRule";
import * as puppeteer from "puppeteer";

// Since ace is loaded from a script tag in the js runtime, we need to declare it here
declare var ace: any;

const acePath = './engine/ace.js';

class PagePool {
  private pages: Array<{page: puppeteer.Page, inUse: boolean, hasScript: boolean}> = [];
  private browser: puppeteer.Browser;
  private maxSize: number;

  constructor(browser: puppeteer.Browser, maxSize = 5) {
    this.browser = browser;
    this.maxSize = maxSize;
  }

  async getPage(): Promise<{page: puppeteer.Page, hasScript: boolean}> {
    const availablePage = this.pages.find(p => !p.inUse);
    
    if (availablePage) {
      availablePage.inUse = true;
      return { page: availablePage.page, hasScript: availablePage.hasScript };
    }

    if (this.pages.length < this.maxSize) {
      console.time('new-pooled-page');
      const page = await this.browser.newPage();
      
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        if (['image', 'stylesheet', 'font', 'media'].includes(request.resourceType())) {
          request.abort();
        } else {
          request.continue();
        }
      });
      console.timeEnd('new-pooled-page');
      
      const pageEntry = { page, inUse: true, hasScript: false };
      this.pages.push(pageEntry);
      return { page, hasScript: false };
    }

    // Check if a page is available every 100ms
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const availablePage = this.pages.find(p => !p.inUse);
        if (availablePage) {
          clearInterval(checkInterval);
          availablePage.inUse = true;
          resolve({ page: availablePage.page, hasScript: availablePage.hasScript });
        }
      }, 100);
    });
  }

  releasePage(page: puppeteer.Page, hasScript: boolean): void {
    const pageEntry = this.pages.find(p => p.page === page);
    if (pageEntry) {
      pageEntry.inUse = false;
      pageEntry.hasScript = hasScript;
    }
  }

  async closeAll(): Promise<void> {
    await Promise.all(this.pages.map(async (p) => {
      try {
        await p.page.close();
      } catch (e) {
        console.error('Error closing page:', e);
      }
    }));
    this.pages = [];
  }
}

let pagePool: PagePool | null = null;

export async function initializePagePool(browser: puppeteer.Browser, maxSize = 5): Promise<void> {
  pagePool = new PagePool(browser, maxSize);
}

export async function closePagePool(): Promise<void> {
  if (pagePool) {
    await pagePool.closeAll();
    pagePool = null;
  }
}

export async function aceCheck(html: string, browser: puppeteer.Browser, guidelineIds?: string | string[]): Promise<Report> {
  console.time('total-execution');
  
  if (!pagePool) {
    pagePool = new PagePool(browser);
  }
  
  console.time('get-page-from-pool');
  const { page, hasScript } = await pagePool.getPage();
  console.timeEnd('get-page-from-pool');
  
  let scriptAdded = false;
  
  try {
    console.time('set-content');
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    console.timeEnd('set-content');
    
    let scriptAdded = hasScript;
    if (!hasScript) {
      console.time('add-script-tag');
      await page.addScriptTag({
        path: require.resolve(acePath)
      });
      scriptAdded = true;
      console.timeEnd('add-script-tag');
    }
    
    console.time('evaluate-check');
    const report = await page.evaluate(async (ids) => {
      const checker = new ace.Checker();
      return await checker.check(document, ids);
    }, guidelineIds);
    console.timeEnd('evaluate-check');
    
    console.timeEnd('total-execution');
    report.results = report.results.filter((result: Issue) => result.value[1] !== "PASS");
    return report;
  } finally {
    pagePool.releasePage(page, scriptAdded);
  }
}

export async function runPerformanceTest(browser: puppeteer.Browser, iterations = 5): Promise<void> {
  const sampleHtml = `<!DOCTYPE html><html lang="en"><head><title>Test</title></head><body><h1>Heading</h1><img src="test.jpg" /></body></html>`;
  
  console.log(`Running ${iterations} iterations with page pooling...`);
  
  if (!pagePool) {
    await initializePagePool(browser, 3);
  }
  
  await aceCheck(sampleHtml, browser, ["WCAG_2_1"]);
  
  const times = [];
  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    await aceCheck(sampleHtml, browser, ["WCAG_2_1"]);
    times.push(Date.now() - start);
  }
  
  console.log(`Average execution time: ${times.reduce((a, b) => a + b, 0) / times.length}ms`);
  console.log(`Individual times: ${times.join(', ')}ms`);
}