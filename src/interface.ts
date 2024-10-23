export interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

export interface TopBuyersHolders {
  chain: string;
  holder_count: number;
  statusNow: StatusNow[];
  statusOld: [Object];
  sold_diff: number;
  sold_part_diff: number;
  hold_diff: number;
  bought_more: number;
  holderInfo: HolderInfo[];
  groupInfo: {
    sold_part: HolderInfo[];
    sold: HolderInfo[];
    bought_more: HolderInfo[];
    hold: HolderInfo[];
  };
}

export interface StatusNow {
  hold: number;
  bought_more: number;
  sold_part: number;
  sold: number;
  transfered: number;
  bought_rate: string;
  holding_rate: string;
  top_10_holder_rate: number;
}

export interface AddressInfo {
  balance: string;
  buy_amount: string;
  first_bought_amount: string;
  first_bought_tax_amount: string;
  history_bought_amount: string;
  history_sold_amount: string;
  maker_token_tags: string[];
  sell_amount: string;
  status: string;
  tags: string[];
  token_address: string;
  wallet_address: string;
}

export interface HolderInfo {
  token_address: string;
  wallet_address: string;
  first_bought_amount: string;
  first_bought_tax_amount: string;
  buy_amount: string;
  sell_amount: string;
  balance: string;
  history_bought_amount: string;
  history_sold_amount: string;
  status: string;
  maker_token_tags: string[];
  tags: string[];
}

export interface RankInfo {
  address: string;
  burn_ratio: string;
  burn_status: string;
  buys: number;
  chain: string;
  creator_close: true;
  creator_token_status: string;
  cto_flag: number;
  dev_token_burn_amount: any;
  dev_token_burn_ratio: any;
  dexscr_ad: number;
  dexscr_update_link: number;
  holder_count: number;
  hot_level: number;
  id: number;
  initial_liquidity: number;
  is_show_alert: boolean;
  launchpad: any;
  launchpad_status: number;
  liquidity: number;
  logo: string;
  market_cap: number;
  open_timestamp: number;
  pool_creation_timestamp: number;
  price: number;
  price_change_percent: number;
  price_change_percent1h: number;
  price_change_percent1m: number;
  price_change_percent5m: number;
  rat_trader_amount_rate: number;
  renounced_freeze_account: number;
  renounced_mint: number;
  sells: number;
  swaps: number;
  symbol: string;
  telegram: string;
  top_10_holder_rate: number;
  twitter_change_flag: number;
  twitter_username: string;
  volume: number;
  website: string;
}
