import * as fs from "fs";
import * as path from "path";
import csv from "csv-parser";
import {
  createObjectCsvWriter as createCsvWriter,
  createObjectCsvWriter,
} from "csv-writer";

interface CsvRow {
  [key: string]: string;
}

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    console.log("not exists ", dirname);
    fs.mkdirSync(dirname, { recursive: true });
  }
}

export const readCsvFile = (filePath: string): Promise<CsvRow[]> => {
  ensureDirectoryExistence(filePath);
  return new Promise((resolve, reject) => {
    const results: CsvRow[] = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data: CsvRow) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
};

export function generateCsvHeader(
  records: object[]
): { id: string; title: string }[] {
  if (records.length === 0) {
    throw new Error("Records array is empty. Cannot generate header.");
  }

  return Object.keys(records[0]).map((key) => ({
    id: key,
    title: key.charAt(0) + key.slice(1),
  }));
}

export async function saveCsvFile(
  filePath: string,
  records: object[],
  append = false
) {
  ensureDirectoryExistence(filePath);

  const header = generateCsvHeader(records);

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: header,
    append,
  });
  await csvWriter.writeRecords(records);
  console.log(`CSV file written successfully to ${filePath}`);
}

export function delay(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function convertTags(tags: string[]): string[] {
  const tagDescriptions: { [key: string]: string } = {
    smart_degen: "聪明钱",
    pump_smart: "pump 聪明钱",
    fresh_wallet: "新钱包",
    snipe_bot: "狙击者",
  };

  return tags.map((tag) => tagDescriptions[tag] || tag);
}

export const chainIdMap: { [key: number]: string } = {
  501: "sol",
  1: "eth",
};

export const formattedDate = (): string => {
  const now = new Date();
  const formattedDate = `${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")} ${String(
    now.getHours()
  ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  return formattedDate;
};

