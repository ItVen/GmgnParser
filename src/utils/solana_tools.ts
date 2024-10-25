import {
  MessageCompiledInstruction,
  PublicKey,
  VersionedTransactionResponse,
} from "@solana/web3.js";

export const TokenProgramID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
export const SystemProgramID = "11111111111111111111111111111111";
export const RaydiumAMMSwapProgramID = "Compute Budget Program";
export const SerumDEXProgramID = "9xQeWvG816bUx9EPjHWhaFq3rxUW9pXRt6zTz3RDa7T";

const ComputeBudgetProgram = "ComputeBudget111111111111111111111111111111";
export const PumpFunProgramId = "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P";

function parseSystemProgramData(
  data: Uint8Array,
  source: PublicKey,
  destination: PublicKey
) {
  const dataView = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const operationCode = dataView.getUint32(0, true); // 操作码应该为 2，表示 transfer 操作
  const lamports = dataView.getBigUint64(4, true); // 读取 8 字节的金额

  return {
    operationCode,
    info: {
      destination: destination.toString(),
      lamports,
      source: source.toString(),
    },
  };
}

function parseComputeBudgetProgramData(data: Uint8Array): {
  operationCode: number;
  computeUnitLimit: number;
} {
  const dataView = new DataView(data.buffer, data.byteOffset, data.byteLength);

  // 读取 1 字节的操作码
  const operationCode = dataView.getUint8(0); // 通常是 1 字节，表示 SetComputeUnitLimit 操作
  //2：SetComputeUnitLimit：
  //3：SetComputeUnitPrice：
  // 读取 4 字节的计算单位上限
  const computeUnitLimit = dataView.getUint32(1, true); // 小端序读取 4 字节的计算单位上限

  return { operationCode, computeUnitLimit };
}

export function parseTokenProgramData(data: Uint8Array): {
  operationCode: number;
  amount: bigint;
} {
  const dataView = new DataView(data.buffer);

  // 读取操作码（假设是前 4 字节）
  const operationCode = dataView.getUint32(0, true);

  // 读取代币数量（8 字节）
  const amount = dataView.getBigUint64(4, true);

  return { operationCode, amount };
}

export function parseRaydiumSwapData(data: Uint8Array): {
  operationCode: number;
  inputAmount: bigint;
  minOutputAmount: bigint;
} {
  const dataView = new DataView(data.buffer);

  // 读取操作码
  const operationCode = dataView.getUint32(0, true); // 小端序

  // 读取输入代币的数量
  const inputAmount = dataView.getBigUint64(4, true); // 小端序

  // 读取最小输出金额
  const minOutputAmount = dataView.getBigUint64(12, true); // 小端序

  return { operationCode, inputAmount, minOutputAmount };
}

export function parseSerumDEXData(data: Uint8Array): {
  operationCode: number;
  orderPrice: bigint;
  orderSize: bigint;
} {
  const dataView = new DataView(data.buffer);

  // 读取操作码
  const operationCode = dataView.getUint32(0, true);

  // 读取订单价格
  const orderPrice = dataView.getBigUint64(4, true);

  // 读取订单大小
  const orderSize = dataView.getBigUint64(12, true);

  return { operationCode, orderPrice, orderSize };
}

export function parseData(
  instruction: MessageCompiledInstruction,
  programId: string,
  accountKeys: PublicKey[]
) {
  const source = accountKeys[instruction.accountKeyIndexes[0]]; // 源账户
  const destination = accountKeys[instruction.accountKeyIndexes[1]]; // 目标账户
  let data = {};
  switch (programId) {
    case ComputeBudgetProgram:
      data = parseComputeBudgetProgramData(instruction.data);
      console.log({ programId, instruction, data });
      break;
    case TokenProgramID:
      data = parseTokenProgramData(instruction.data);
      break;
    case SystemProgramID:
      data = parseSystemProgramData(instruction.data, source, destination);

      break;
    default:
      break;
  }
}

export function extractTransactionType(logs: string[]): string {
  if (logs.find((log) => log.includes("Instruction: Buy"))) {
    return "buy";
  } else if (logs.find((log) => log.includes("Instruction: Sell"))) {
    return "sell";
  } else if (logs.find((log) => log.includes("Instruction: Transfer"))) {
    return "transfer";
  } else {
    return "unknown";
  }
}
