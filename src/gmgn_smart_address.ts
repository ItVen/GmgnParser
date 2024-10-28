import { Browser } from "puppeteer";
import { createBrowser, scrapePage } from "./proxy/puppeteer";
import { AdderssList, ApiResponse, SmartAddress } from "./utils/interface";

import {
  convertTags,
  formattedDate,
  readCsvFile,
  saveCsvFile,
} from "./utils/tools";

class SmartAddressAnalyzer {
  async analyzeAddresses(
    chain: string,
    browser: Browser,
    time: string,
    tag?: string
  ): Promise<AdderssList[]> {
    const list = await this.getPumpSmartDtat(chain, browser, time, tag);
    if (!list) {
      console.log("list error data is null");
      return [];
    }
    console.log(`${tag} len ${list.length}`);
    return list;
  }

  private async getPumpSmartDtat(
    chain: string,
    browser: Browser,
    time: string,
    tag?: string
  ) {
    let proxyUrl = `https://gmgn.ai/defi/quotation/v1/rank/${chain}/wallets/7d?tag=${tag}&orderby=winrate_7d&direction=desc`;
    if (!tag) {
      proxyUrl = `https://gmgn.ai/defi/quotation/v1/rank/${chain}/wallets/7d?orderby=winrate_7d&direction=desc`;
    }

    try {
      const res: ApiResponse<{ rank: SmartAddress[] }> = await scrapePage(
        proxyUrl,
        browser
      );
      console.log(res.data.rank.length);
      return this.paseRank(res.data.rank, time);
    } catch (error) {
      console.error(`error ${error}`);
      return null;
    }
  }

  paseRank = async (
    rank: SmartAddress[],
    time: string
  ): Promise<AdderssList[]> => {
    let list: any[] = [];
    for (let item of rank) {
      const data: AdderssList = {
        address: item.address,
        realized_profit: item.realized_profit,
        balance: item.balance,
        winrate_7d: item.winrate_7d ? item.winrate_7d : 0,
        tag_rank: JSON.stringify(item.tag_rank),
        tags: convertTags(item.tags),
        twitter_name: item.twitter_name,
        twitter_username: item.twitter_username,
        name: item.name,
        time,
      };
      list.push(data);
    }

    return list;
  };

  removeDuplicates = (list: AdderssList[]) => {
    const seen = new Set<string>();
    const uniqueList = list.filter((item) => {
      if (seen.has(item.address)) {
        return false;
      }
      seen.add(item.address);
      return true;
    });
    uniqueList.sort((a, b) => b.winrate_7d - a.winrate_7d);
    return uniqueList;
  };
}
export async function gmgnMain(browser?: Browser) {
  let close = false;
  if (!browser) {
    browser = await createBrowser(false);
    close = true;
  }
  let smartAddressAnalyzer = new SmartAddressAnalyzer();
  const tags = [
    undefined,
    "pump_smart",
    "snipe_bot",
    "smart_degen&tag=pump_smart",
    "fresh_wallet",
    "renowned",
  ];
  const chainList = ["sol", "eth"];
  const time = formattedDate();
  await Promise.all(
    chainList.map(async (chain) => {
      let list: AdderssList[] = [];
      await Promise.all(
        tags.map(async (tag) => {
          const addressList = await smartAddressAnalyzer.analyzeAddresses(
            chain,
            browser,
            time,
            tag
          );
          list = list.concat(addressList);
        })
      );
      list = smartAddressAnalyzer.removeDuplicates(list);
      if (list.length > 0) {
        await compareCsv(list, chain);
      }
    })
  );
  if (close) {
    await browser.close();
  }
}

const compareCsv = async (smartMoney: AdderssList[], chianInfo: string) => {
  const path = `./csv/GMGN_${chianInfo}_Address.csv`;
  await saveCsvFile(path, smartMoney);
  try {
    const history = await readCsvFile(path);
    console.log("history", history);
    const oldAddresses = new Set<string>(history.map((item) => item.address));
    const uniqueNewItems = smartMoney.filter(
      (item) => !oldAddresses.has(item.address)
    );
    const list = [...history, ...uniqueNewItems];
    await saveCsvFile(path, list);
  } catch (error) {
    console.log("error", error);
    console.log("path", path);
    await saveCsvFile(path, smartMoney);
  }
}; 



  