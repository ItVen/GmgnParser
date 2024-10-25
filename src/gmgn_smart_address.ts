import { scrapePage } from "./proxy/puppeteer";
import { AdderssList, ApiResponse, SmartAddress } from "./utils/interface";

import { convertTags, saveCsvFile } from "./utils/tools";

class SmartAddressAnalyzer {
  async analyzeAddresses(chain: string, tag?: string): Promise<AdderssList[]> {
    const list = await this.getPumpSmartDtat(chain, tag);
    if (!list) {
      console.log("list error data is null");
      return [];
    }
    console.log(`${tag} len ${list.length}`);
    return list;
  }

  private async getPumpSmartDtat(chain: string, tag?: string) {
    let proxyUrl = `https://gmgn.ai/defi/quotation/v1/rank/${chain}/wallets/7d?tag=${tag}&orderby=winrate_7d&direction=desc`;
    if (!tag) {
      proxyUrl = `https://gmgn.ai/defi/quotation/v1/rank/${chain}/wallets/7d?orderby=winrate_7d&direction=desc`;
    }

    try {
      const res: ApiResponse<{ rank: SmartAddress[] }> = await scrapePage(
        proxyUrl
      );
      console.log(res.data.rank.length);
      return this.paseRank(res.data.rank);
    } catch (error) {
      console.error(`error ${error}`);
      return null;
    }
  }

  paseRank = async (rank: SmartAddress[]): Promise<AdderssList[]> => {
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
async function main() {
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
  chainList.map(async (chain) => {
    let list: AdderssList[] = [];
    await Promise.all(
      tags.map(async (tag) => {
        const addressList = await smartAddressAnalyzer.analyzeAddresses(
          chain,
          tag
        );
        list = list.concat(addressList);
      })
    );
    list = smartAddressAnalyzer.removeDuplicates(list);
    if (list.length > 0) {
      const now = new Date();
      const formattedDate = `${String(now.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(now.getDate()).padStart(2, "0")} ${String(
        now.getHours()
      ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      await saveCsvFile(`./GMGN_${chain}_Address_${formattedDate}.csv`, list);
    }
  });
}

main().catch(console.error);
