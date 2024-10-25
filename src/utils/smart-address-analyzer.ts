import {
  Connection,
  PublicKey,
  VersionedTransactionResponse,
} from "@solana/web3.js";
import { fetchWithFlareSolverr } from "../proxy/flaresolverr";
import {
  ApiResponse,
  HolderInfo,
  RankInfo,
  TopBuyersHolders,
  TransactionInfo,
} from "./interface";
import { parseHolders } from "./address";
import { saveCsvFile } from "./tools";
import * as dotenv from "dotenv";
import {
  extractTransactionType,
  parseData,
  PumpFunProgramId,
  TokenProgramID,
} from "./solana_tools";
dotenv.config();
class SmartAddressAnalyzer {
  public connection: Connection;
  private cache: Map<string, any>;

  constructor(rpcEndpoint: string) {
    this.connection = new Connection(rpcEndpoint);
    this.cache = new Map(); // 简单缓存机制
  }

  // 获取并分析地址
  async analyzeAddresses(tokenAddress: string) {
    const gmgnData = await this.getGMGNData(tokenAddress);
    if (!gmgnData) {
      console.log("getGMGNData error data is null");
      return [];
    }

    const enrichedAddresses = await this.enrichAddressData(gmgnData.address);

    const smartAddresses = await this.filterSmartAddresses(enrichedAddresses);

    return smartAddresses;
  }

  private async getGMGNData(tokenAddress: string) {
    const proxyUrl = `https://gmgn.ai/defi/quotation/v1/tokens/top_buyers/sol/${tokenAddress}`;

    // 缓存结果，避免重复请求
    if (this.cache.has(proxyUrl)) {
      return this.cache.get(proxyUrl);
    }
    try {
      const res: ApiResponse<{ holders: TopBuyersHolders }> =
        await fetchWithFlareSolverr(proxyUrl);
      const parsedHolders = parseHolders(res.data.holders);

      this.cache.set(proxyUrl, parsedHolders);
      return parsedHolders;
    } catch (error) {
      console.error(`error ${error}`);
      return null;
    }
  }

  private async enrichAddressData(addresses: string[]) {
    // 使用 Promise.all 并行化处理，提升性能
    const enrichedData = await Promise.all(
      addresses.map(async (address) => {
        try {
          const txHistory = await this.getTransactionHistory(address);
          const tradingPattern = await this.analyzeTradingPattern(txHistory);
          return {
            address,
            transactions: txHistory,
            pattern: tradingPattern,
            performance: await this.calculatePerformance(txHistory),
          };
        } catch (error) {
          console.error(`Error processing address ${address}:`, error);
          return null; // 忽略错误地址
        }
      })
    );

    return enrichedData.filter((data) => data !== null);
  }

  async getTransactionHistory(address: string, limit = 50) {
    const pubkey = new PublicKey(address);

    // 缓存交易历史，避免重复请求
    // if (this.cache.has(address)) {
    //   return this.cache.get(address);
    // }

    const signatures = await this.connection.getSignaturesForAddress(pubkey, {
      limit,
    });
    console.log(`signatures length ${signatures.length}`);

    const transactions: TransactionInfo[] = [];
    for (const sig of signatures) {
      const tx = await this.connection.getTransaction(sig.signature, {
        maxSupportedTransactionVersion: 0,
      });
      if (tx) {
        transactions.push(this.parseTransaction(tx));
      }
    }

    // this.cache.set(address, transactions);
    return transactions;
  }

  parseTransaction(tx: VersionedTransactionResponse): TransactionInfo {
    const message = tx.transaction.message;
    let type = "unkown";
    let amount = 0;
    const instructions = message.compiledInstructions;
    const timestamp = tx.blockTime as number;
    const logs = tx.meta?.logMessages;
    if (logs) {
      type = extractTransactionType(logs);
      const gasPriceLog = logs.find((log) => log.includes("Program consumed"));
      const gasPrice = gasPriceLog ? parseFloat(gasPriceLog.split(" ")[2]) : 0;
    }
    let accountKeys = tx.transaction.message.staticAccountKeys;
    let tokenAddress = instructions.find((instruction) => {
      const programId =
        tx.transaction.message.staticAccountKeys[
          instruction.programIdIndex
        ].toBase58();
      if (programId === PumpFunProgramId) {
        const tokenAddressIndex =
          instruction.accountKeyIndexes[1] || instruction.accountKeyIndexes[0];
        const tokenAddress = accountKeys[tokenAddressIndex]?.toBase58();
        return tokenAddress;
      } else {
        return null;
      }
    });
    console.log({ tokenAddress, type, logs });
    // 遍历交易指令，查找与代币转移相关的指令
    // for (const instruction of instructions) {
    //   // 假设我们在使用常见的 DEX，如 Serum 或 Raydium
    //   const programId =
    //     tx.transaction.message.staticAccountKeys[
    //       instruction.programIdIndex
    //     ].toBase58();

    //   console.log(logs);
    //   // parseData(instruction, programId, accountKeys);
    //   // if (
    //   //   programId === "SerumProgramPublicKey" ||
    //   //   programId === "RaydiumProgramPublicKey"
    //   // ) {
    //   //   // 提取交易类型、金额等信息
    //   //   const isBuy = this.isBuyInstruction(instruction);
    //   //   type = isBuy ? "buy" : "sell";
    //   //   amount = this.extractAmountFromInstruction(instruction);
    //   // }
    // }
    // // 简化交易数据解析逻辑
    return {
      timestamp,
      // tokenAddress: tx.transaction.message.accountKeys[0].toBase58(), // 解析代币地址
      tokenAddress: "", // 解析代币地址
      type: type,
      amount: amount,
      profit: 0, // 获利情况 (需要更多信息来计算)
      gasPrice: 0, // gas设置
    };
  }
  async parseInnerInstructions(transaction: VersionedTransactionResponse) {
    const innerInstructions = transaction.meta?.innerInstructions || [];

    // innerInstructions.forEach((innerInstruction, index) => {
    //   console.log(`\nInner Instruction Set #${index + 1}:`);

    //   innerInstruction.instructions.forEach((instruction, innerIndex) => {
    //     const programId =
    //       transaction.transaction.message.staticAccountKeys[
    //         instruction.programIdIndex
    //       ].toBase58();
    //     console.log(`  Inner Instruction ${innerIndex + 1}:`);
    //     console.log(`programId: ${programId}`);

    //     // 提取账户信息：使用 accounts 而不是 accountKeyIndexes
    //     const accounts = instruction.accounts.map((index) =>
    //       transaction.transaction.message.staticAccountKeys[index].toBase58()
    //     );
    //     console.log(`accounts: ${accounts}`);

    //     console.log(instruction);

    //     // 打印账户信息
    //     // if (programId === "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") {
    //     //   console.log(`    Token Program Transfer:`);
    //     //   console.log(`      Token: ${accounts[0]}`);
    //     //   console.log(`      Amount: ...`); // 解析 `instruction.data` 获取代币转账数量
    //     // } else if (programId === "11111111111111111111111111111111") {
    //     //   console.log(`    System Program Transfer:`);
    //     //   console.log(`      From Address: ${accounts[0]}`);
    //     //   console.log(`      To Address: ${accounts[1]}`);
    //     //   console.log(`      Transfer Amount (SOL): ...`); // 解析 `instruction.data` 获取 SOL 转账数量
    //     // }
    //   });
    // });
  }

  private async analyzeTradingPattern(transactions: TransactionInfo[]) {
    return {
      avgHoldingTime: this.calculateAvgHoldingTime(transactions),
      successRate: this.calculateSuccessRate(transactions),
      avgProfit: this.calculateAvgProfit(transactions),
      preferredGasStrategy: this.analyzeGasStrategy(transactions),
      tradingFrequency: this.calculateTradingFrequency(transactions),
    };
  }

  private async filterSmartAddresses(enrichedData: any[]) {
    return enrichedData.filter((data) => {
      const { pattern, performance } = data;
      return (
        pattern.successRate > 0.6 && // 60%以上成功率
        pattern.avgProfit > 0.3 && // 30%以上平均利润
        pattern.tradingFrequency > 2 && // 较活跃的交易频率
        performance.totalTrades > 5 // 至少5笔交易记录
      );
    });
  }

  // 计算平均持有时间
  private calculateAvgHoldingTime(txs: TransactionInfo[]) {
    const buySellPairs = txs.filter(
      (tx) => tx.type === "buy" || tx.type === "sell"
    );
    if (buySellPairs.length < 2) return 0;

    let totalHoldTime = 0;
    for (let i = 0; i < buySellPairs.length - 1; i += 2) {
      const buyTime = new Date(buySellPairs[i].timestamp).getTime(); // 转换为毫秒时间戳
      const sellTime = new Date(buySellPairs[i + 1].timestamp).getTime();
      totalHoldTime += sellTime - buyTime;
    }

    return totalHoldTime / (buySellPairs.length / 2);
  }

  // 计算成功率
  private calculateSuccessRate(txs: TransactionInfo[]) {
    const profitableTrades = txs.filter((tx) => tx.profit > 0).length;
    return profitableTrades / txs.length;
  }

  // 计算平均利润
  private calculateAvgProfit(txs: TransactionInfo[]) {
    const totalProfit = txs.reduce((sum, tx) => sum + tx.profit, 0);
    return totalProfit / txs.length;
  }

  // 分析 Gas 策略
  private analyzeGasStrategy(txs: TransactionInfo[]) {
    const gasPrices = txs.map((tx) => tx.gasPrice);
    const avgGasPrice =
      gasPrices.reduce((sum, gas) => sum + gas, 0) / gasPrices.length;
    return avgGasPrice;
  }

  // 计算交易频率
  private calculateTradingFrequency(txs: TransactionInfo[]) {
    if (txs.length < 2) return 0;

    const firstTx = new Date(txs[0].timestamp).getTime();
    const lastTx = new Date(txs[txs.length - 1].timestamp).getTime();

    // 计算总的时间间隔，单位为秒
    const totalDurationInSeconds = (lastTx - firstTx) / 1000;

    // 每秒交易次数
    const frequencyPerSecond = txs.length / totalDurationInSeconds;

    // 返回每小时的交易次数
    return frequencyPerSecond * 3600; // 每小时有 3600 秒
  }

  // 计算整体表现
  private calculatePerformance(txs: TransactionInfo[]) {
    const totalTrades = txs.length;
    const profitableTrades = txs.filter((tx) => tx.profit > 0).length;
    const totalProfit = txs.reduce((sum, tx) => sum + tx.profit, 0);
    const avgReturnPerTrade = totalProfit / totalTrades;

    return {
      totalTrades,
      profitableTrades,
      totalProfit,
      avgReturnPerTrade,
    };
  }
}
const rpc = process.env.SOL_PRC_URL as string;
const analyzer = new SmartAddressAnalyzer(rpc);
// 使用示例
// async function main() {

//   const hotRank5m = async () => {
//     const proxyUrl = `https://gmgn.ai/defi/quotation/v1/rank/sol/swaps/5m?orderby=open_timestamp&direction=desc&filters[]=renounced&filters[]=frozen`;

//     const res: ApiResponse<{ rank: RankInfo[] }> = await fetchWithFlareSolverr(
//       proxyUrl
//     );
//     return res.data.rank;
//   };

//   const rank = await hotRank5m();
//   for (const item of rank) {
//     console.log(`Analyzing token: ${item.symbol}`);
//     const smartAddresses = await analyzer.analyzeAddresses(item.address);
//     if (smartAddresses.length > 0) {
//       // 批量保存分析结果，避免逐个保存
//       await saveCsvFile("./smart_addresses.csv", smartAddresses);
//     }
//     console.log(`smartAddresses: ${smartAddresses}`);
//   }
// }

// main().catch(console.error);

let address = "8TyCE2H2RW3VTGRGqpXaJkSyN4tXZ1yzrQAQVQU7bz7e";
let signature =
  "2DMq9pEZ1DjK4f9VHR41ES6q4baFSKorEBjfy6tEn7CMoo6ChvLRDBd2bCD1441tTTWbAmZN6rebMt138VpEbwwz";

const test = async () => {
  const tx = await analyzer.connection.getTransaction(signature, {
    maxSupportedTransactionVersion: 0,
  });
  if (tx) {
    // analyzer.parseTransaction(tx);
    analyzer.parseInnerInstructions(tx);
  }
};

test().catch(console.error);
