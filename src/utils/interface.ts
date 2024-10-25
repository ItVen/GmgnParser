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

export interface TransactionInfo {
  timestamp: number;
  tokenAddress: string;
  type: string;
  amount: number;
  profit: number;
  gasPrice: number;
}

export interface SmartAddress {
  wallet_address: string;
  address: string;
  realized_profit: number;
  buy: number;
  sell: number;
  last_active: number;
  realized_profit_1d: number;
  realized_profit_7d: number;
  realized_profit_30d: number;
  pnl_30d: number;
  pnl_7d: number;
  pnl_1d: number;
  txs_30d: number;
  buy_30d: number;
  sell_30d: number;
  balance: number;
  eth_balance: number;
  sol_balance: number;
  trx_balance: number;
  twitter_username?: string;
  avatar: string;
  ens: string;
  tag: string;
  tag_rank: TagRank;
  nickname: string;
  tags: string[];
  twitter_name: string[];
  followers_count: number;
  is_blue_verified: boolean;
  twitter_description: string;
  name: string;
  avg_hold_time: number;
  recent_buy_tokens: any[];
  winrate_7d: number;
  avg_cost_7d: number;
  pnl_lt_minus_dot5_num_7d: number;
  pnl_minus_dot5_0x_num_7d: number;
  pnl_lt_2x_num_7d: number;
  pnl_2x_5x_num_7d: number;
  pnl_gt_5x_num_7d: number;
  pnl_lt_minus_dot5_num_7d_ratio: number;
  pnl_minus_dot5_0x_num_7d_ratio: number;
  pnl_lt_2x_num_7d_ratio: number;
  pnl_2x_5x_num_7d_ratio: number;
  pnl_gt_5x_num_7d_ratio: number;
  daily_profit_7d: DailyProfi[];
  txs: number;
  token_num_7d: number;
}

interface DailyProfi {
  timestamp: number;
  profit: number;
}

interface TagRank {
  smart_degen: number;
  pump_smart: number;
  bluechip_owner: number;
  kol: number;
  snipe_bot: number;
  fresh_wallet: number;
}

export interface AdderssList {
  address: string;
  realized_profit: number;
  balance: number;
  winrate_7d: number;
  tag_rank: string;
  tags: string[];
  twitter_name?: string[];
  twitter_username?: string;
  name?: string;
}