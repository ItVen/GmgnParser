import { Browser } from "puppeteer";
import { createBrowser, scrapePage } from "./proxy/puppeteer";
import { AdderssList } from "./utils/interface";
import {
  MeMeList,
  OKXApiResponse,
  SmartMoney,
  SmartMoneyList,
  TokenData,
} from "./utils/okx-interface";
import { chainIdMap, saveCsvFile, formattedDate } from "./utils/tools";

const MAX_CONCURRENT_REQUESTS = 5; // 控制并发数

class OkxSmartAddressAnalyzer {
  okxTokenMap = new Map<number, TokenData[]>();
  okxTokenSmartMoneyMap = new Map<number, SmartMoney[]>();

  async analyzeAddresses(chain: string, tag?: string): Promise<AdderssList[]> {
    return [];
  }

  async fetchPaginatedData<T>(
    browser: Browser,
    url: URL,
    processResult: (res: OKXApiResponse<T>) => void,
    pageSize: number
  ): Promise<void> {
    let pageNo = 1;
    const requests: Promise<void>[] = []; // 收集所有请求
    let total = 0;

    // 先获取第一页数据并获取总量
    try {
      url.searchParams.set("pageNo", pageNo.toString());
      url.searchParams.set("t", Date.now().toString());
      const res: OKXApiResponse<T> = await scrapePage(
        url.toString(),
        browser,
        10
      );
      processResult(res);
      total = (res.data as any).total;
      pageNo++;
    } catch (error) {
      console.error(`error ${error}`);
      return;
    }

    // 计算剩余页数，并发控制请求
    const totalPages = Math.ceil(total / pageSize);
    for (pageNo; pageNo <= totalPages; pageNo++) {
      url.searchParams.set("pageNo", pageNo.toString());
      url.searchParams.set("t", Date.now().toString());
      requests.push(
        scrapePage(url.toString(), browser, 10)
          .then((res: OKXApiResponse<T>) => {
            processResult(res);
          })
          .catch((error) => console.error(`Page ${pageNo} error: ${error}`))
      );

      // 控制并发数
      if (requests.length >= MAX_CONCURRENT_REQUESTS) {
        await Promise.allSettled(requests);
        requests.length = 0; // 清空已完成的请求
      }
    }
    await Promise.allSettled(requests); // 处理剩余请求
  }

  async queryTokens(
    browser: Browser,
    chainId: number,
    txnSource = [1]
  ): Promise<void> {
    const url = new URL(
      "https://www.okx.com/priapi/v1/invest/activity/smart-money/token/page"
    );
    url.searchParams.set("chainId", chainId.toString());
    url.searchParams.set("txnSource", txnSource.join(","));
    url.searchParams.set("pageSize", "50");
    url.searchParams.set("duration", "3");
    url.searchParams.set("order", "tokenTradingTime");

    await this.fetchPaginatedData<MeMeList>(
      browser,
      url,
      (res) => {
        const existingList = this.okxTokenMap.get(chainId) || [];
        this.okxTokenMap.set(chainId, existingList.concat(res.data.result));
      },
      50
    );
  }

  async queryTokenSmartMoney(
    browser: Browser,
    chainId: number,
    tokenAddress: string,
    tokenSymbol: string
  ): Promise<void> {
    const url = new URL(
      "https://www.okx.com/priapi/v1/invest/activity/smart-money/token/holding/list"
    );
    url.searchParams.set("chainId", chainId.toString());
    url.searchParams.set("tokenAddress", tokenAddress);
    url.searchParams.set("pageSize", "50");

    await this.fetchPaginatedData<SmartMoneyList>(
      browser,
      url,
      (res) => {
        const updatedResults = res.data.result.map((result) => ({
          ...result,
          holdingTokenAmount: `${result.holdingTokenAmount} ${tokenSymbol}`,
        }));
        const existingList = this.okxTokenSmartMoneyMap.get(chainId) || [];
        this.okxTokenSmartMoneyMap.set(
          chainId,
          existingList.concat(updatedResults)
        );
      },
      50
    );
  }

  removeDuplicates(list: AdderssList[]): AdderssList[] {
    const seen = new Set<string>();
    return list
      .filter((item) => !seen.has(item.address) && seen.add(item.address))
      .sort((a, b) => b.winrate_7d - a.winrate_7d);
  }
}

export async function okxMain(browser: Browser) {
  const time = formattedDate();
  const smartAddressAnalyzer = new OkxSmartAddressAnalyzer();
  const chainIds = [501, 1];
  const txnSource = [[1, 2], [1]];

  await Promise.all(
    chainIds.map((chainId, index) =>
      smartAddressAnalyzer.queryTokens(browser, chainId, txnSource[index])
    )
  );

  const batchSize = 50;
  for (const chainId of chainIds) {
    const list = smartAddressAnalyzer.okxTokenMap.get(chainId);
    if (!list) continue;

    for (let i = 0; i < list.length; i += batchSize) {
      const batch = list.slice(i, i + batchSize);
      console.log(`list.length: ${list.length} i: ${i}`);
      await Promise.allSettled(
        batch.map((token) =>
          smartAddressAnalyzer.queryTokenSmartMoney(
            browser,
            chainId,
            token.tokenAddress,
            token.tokenSymbol
          )
        )
      );
    }

    const smartMoney = smartAddressAnalyzer.okxTokenSmartMoneyMap.get(chainId);
    console.log(`smartMoney list.length: ${smartMoney?.length} `);
    if (smartMoney) {
      await saveCsvFile(
        `./OKX_${chainIdMap[chainId]}_Address_${time}.csv`,
        smartMoney
      );
    }
  }
}
