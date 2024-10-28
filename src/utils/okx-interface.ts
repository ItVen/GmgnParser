export interface OKXApiResponse<T> {
  code: number;
  msg: string;
  error_code: string;
  error_message: string;
  detailMsg: string;
  data: T;
}

export interface MeMeList {
  total: number;
  result: TokenData[];
}

export interface TokenData {
  tokenSymbol: string;
  tokenLogo: string;
  tokenAddress: string;
  chainId: number;
  securityRenameFlag: boolean;
  securityMintFlag: boolean;
  tokenFDV: string;
  tokenLiquidity: string;
  tradeVolume5: string;
  tradeVolume60: string;
  tradeVolume1440: string;
  tokenTradingTime: string;
  tokenCreateTime: string;
  tokenPriceChange5: string;
  tokenPriceChange60: string;
  tokenPriceChange1440: string;
  smartMoneyCount: number;
  latestOrderPrice: string;
  smartMoneyBuyCount: string;
  smartMoneyBuyAmount: string;
  smartMoneySellCount: string;
  smartMoneySellAmount: string;
  transactionAction: string;
  total?: number;
  transactionSource: number;
  sourceLogo: string;
  innerSourceFlag: boolean;
}

export interface SmartMoneyList {
  total: number;
  result: SmartMoney[];
}

export interface SmartMoney {
  userWalletAddress?: string;
  address: string;
  winRate: string;
  tags: string[];
  time: string;
}
