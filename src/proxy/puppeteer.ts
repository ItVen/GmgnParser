import { Browser, Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { delay } from "../utils/tools";

puppeteer.use(StealthPlugin());

export async function createBrowser(headless: boolean): Promise<Browser> {
  return await puppeteer.launch({
    headless,
    userDataDir: `./tmp/session`,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--single-process",
      "--no-zygote",
    ],
  });
}

export async function scrapePage(
  url: string,
  browser: Browser,
  delay_time = 5000,
  maxRetries = 3,
  retryDelay = 2000
) {
  let retryCount = 0;
  while (retryCount <= maxRetries) {
    const page = await browser.newPage();
    try {
      await page.goto(url);
      await delay(delay_time); // Cloudflare verify time

      await page.waitForSelector(".json-formatter-container", {
        timeout: 10000,
      });
      const jsonData = await getJsonData(page);

      return jsonData; // 成功获取数据后直接返回
    } catch (error) {
      console.log(
        `Retry ${
          retryCount + 1
        }/${maxRetries}: .json-formatter-container not found`
      );

      retryCount += 1;
      if (retryCount > maxRetries) {
        console.error("Max retries reached. Aborting...");
        return null; // 超过最大重试次数后返回 null
      }

      await delay(retryDelay); // 在重试前稍作等待
    } finally {
      await page.close(); // 确保页面在每次循环后关闭
    }
  }
}

async function getJsonData(page: Page): Promise<any> {
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
