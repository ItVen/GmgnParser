import { chromium, Page } from "playwright";
import { delay } from "../utils/tools";

export async function scrapePage(url: string) {
  const browser = await chromium.launch({
    headless: false, // 设置为 true 进行无头模式
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(url);

  console.log("请手动完成 Cloudflare 验证...");
  await page.waitForTimeout(5000);

  console.log("开始抓取数据...");

  await page.waitForSelector(".json-formatter-container"); // 等待特定的选择器

  const jsonData = await page.evaluate(() => {
    // 找到包含 JSON 的元素（假设它在 <pre> 标签中）
    const preElement = document.querySelector("pre");
    if (preElement) {
      try {
        // 提取并解析 JSON 数据
        const jsonText = preElement.textContent || "";
        return JSON.parse(jsonText); // 将字符串解析为 JSON 对象
      } catch (error) {
        console.error("Error parsing JSON:", error);
        return null;
      }
    } else {
      console.error("No <pre> element found.");
      return null;
    }
  });

  await browser.close();
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
//test
const url =
  "https://gmgn.ai/defi/quotation/v1/rank/sol/wallets/7d?tag=smart_degen&tag=pump_smart&orderby=pnl_7d&direction=desc&limit=1000";
scrapePage(url)
  .then((data) => console.log("抓取到的数据:", data))
  .catch(console.error);
