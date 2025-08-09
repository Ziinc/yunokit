import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const dir = resolve('screenshots');
mkdirSync(dir, { recursive: true });

const file = resolve(dir, 'home.png');

const capture = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(process.env.APP_URL ?? 'http://localhost:8080');
  await page.screenshot({ path: file });
  await browser.close();
};

capture().catch((error) => {
  console.error(error);
  process.exit(1);
});
