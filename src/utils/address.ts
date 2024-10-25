import {
  ApiResponse,
  HolderInfo,
  RankInfo,
  TopBuyersHolders,
} from "./interface";
import { fetchWithFlareSolverr } from "../proxy/flaresolverr";
import { saveCsvFile } from "./tools";

const showAddress = async (tokenAddress: string) => {
  const proxyUrl = `https://gmgn.ai/defi/quotation/v1/tokens/top_buyers/sol/${tokenAddress}`;
  const res: ApiResponse<{ holders: TopBuyersHolders }> =
    await fetchWithFlareSolverr(proxyUrl);
  try {
    const data = parseHolders(res.data.holders);
    return data;
  } catch (error) {
    return null;
  }
};

export const parseHolders = (holders: TopBuyersHolders) => {
  const groupInfo = holders.groupInfo;
  let bought_more: HolderInfo[] = [];
  if (groupInfo.bought_more) {
    bought_more = groupInfo.bought_more;
  }

  let token_address = holders.holderInfo[0].token_address;

  const bought_more_addresses = bought_more.map((bought_info) => {
    return bought_info.wallet_address;
  });
  return {
    token_address,
    address: bought_more_addresses,
  };
};

const hotRank5m = async () => {
  const proxyUrl = `https://gmgn.ai/defi/quotation/v1/rank/sol/swaps/5m?orderby=open_timestamp&direction=desc&filters[]=renounced&filters[]=frozen
`;
  const res: ApiResponse<{ rank: RankInfo[] }> = await fetchWithFlareSolverr(
    proxyUrl
  );
  paseRank(res.data.rank);
};
const paseRank = async (rank: RankInfo[]) => {
  let list: any[] = [];
  for (let item of rank) {
    if (!item.website || !item.website) {
      continue;
    }
    console.log(item.address);
    const data = await showAddress(item.address);
    if (data) {
      list.push({
        symbol: item.symbol,
        chain: item.chain,
        price: item.price,
        ...data,
      });
    }
  }
  await saveCsvFile("./address.csv", list);
};

hotRank5m();
