import { Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { delay } from "../utils/tools";

puppeteer.use(StealthPlugin());

export async function scrapePage(url: string) {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  await page.goto(url);
  await delay(5000); // Cloudflare verify time

  const jsonData = await getJsonData(page);
  if (jsonData) {
    await browser.close();
  }

  return jsonData;
}

async function getJsonData(page: Page): Promise<any> {
  try {
    await page.waitForSelector(".json-formatter-container");
  } catch (error) {
    await delay(5000);
    console.log(".json-formatter-container not find Waiting 5s");
    return getJsonData(page);
  }
  const jsonData = await page.evaluate(() => {
    const preElement = document.querySelector("pre");
    if (preElement) {
      try {
        const jsonText = preElement.textContent || "";
        return JSON.parse(jsonText);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        return null;
      }
    } else {
      console.error("No <pre> element found.");
      return null;
    }
  });

  return jsonData;
}
