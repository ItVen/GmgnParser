import axios from "axios";

const headers = {
  accept: "application/json, text/plain, */*",
  "accept-language": "zh-CN,zh;q=0.9,ru;q=0.8,en;q=0.7",
  "cache-control": "no-cache",
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36", // 与 Postman 一致
  cookie: "", // 初始化为空
};
export async function fetchGasPrice() {
  try {
    const proxyUrl = "https://gmgn.ai/defi/quotation/v1/chains/sol/gas_price";
    let response = await fetch(proxyUrl, {
      headers,
    });
    if (!response.ok) {
      console.log("Response Data:", response.status);
      return;
    }
    console.log("Response Data:", await response.text());
  } catch (error: any) {
    console.error(
      "Request failed:",
      error.response?.status,
      error.response?.data || error.message
    );
  }
}

export async function fetchTokenSecuritySol() {
  try {
    const proxyUrl =
      "https://gmgn.ai/api/v1/token_security_sol/sol/3DeXyvx64hyRrTXzzUbTxpEfmmgwxaFacr11pqrVpump";
    let response = await fetch(proxyUrl, {
      headers,
    });
    if (!response.ok) {
      console.log("Response Data:", response.status);
      return;
    }
    console.log("Response Data:", await response.json());
  } catch (error: any) {
    console.error(
      "Request failed:",
      error.response?.status,
      error.response?.data || error.message
    );
  }
}

export async function fetchTokenrRugInfo() {
  try {
    const proxyUrl =
      "https://gmgn.ai/api/v1/token_rug_info/sol/8oRPV2mXpG5dkhWHg69y2BsiQDfugiMh3wC9QG7LbGUH";
    let response = await fetch(proxyUrl, {
      headers,
    });
    if (!response.ok) {
      console.log("Response Data:", response.status);
      return;
    }
    console.log("Response Data:", await response.json());
  } catch (error: any) {
    console.error(
      "Request failed:",
      error.response?.status,
      error.response?.data || error.message
    );
  }
}

export async function fetchTradesSol(token: string) {
  try {
    const proxyUrl = `https://gmgn.ai/defi/quotation/v1/trades/sol/${token}?limit=1000&maker=`;
    let response = await fetch(proxyUrl, {
      headers,
    });
    if (!response.ok) {
      console.log("Response Data:", response.status);
      throw new Error(`Failed to fetch ${proxyUrl}`);
    }
    const res = await response.json();
    return res;
  } catch (error: any) {
    console.error(
      "Request failed:",
      error.response?.status,
      error.response?.data || error.message
    );
  }
}

export async function fetchTopBuyers(token: string) {
  try {
    const proxyUrl = `https://gmgn.ai/defi/quotation/v1/tokens/top_buyers/sol/${token}`;
    let response = await fetch(proxyUrl, {
      headers,
    });
    if (!response.ok) {
      console.log("Response Data:", response.status);
      throw new Error(`Failed to fetch ${proxyUrl}`);
    }
    const res = await response.json();
    console.log(res);
    return res;
  } catch (error: any) {
    console.error(
      "Request failed:",
      error.response?.status,
      error.response?.data || error.message
    );
  }
}

// fetchTopBuyers("8192VvNgHrNxq9S8PKcftKwC1WZCxmGmxPg4NvLqpump");

async function fetchCookie() {
  const url =
    "https://gmgn.ai/defi/quotation/v1/tokens/top_buyers/sol/8192VvNgHrNxq9S8PKcftKwC1WZCxmGmxPg4NvLqpump";

  try {
    // 第一次请求，尝试获取 Set-Cookie
    let setCookie: string | undefined;
    try {
      await axios.get(url, { headers });
    } catch (error) {
      const response = (error as any).response;
      setCookie = response?.headers["set-cookie"]?.[0]?.split(";")[0];
      if (setCookie) {
        headers.cookie = setCookie; // 保存 Cookie
        console.log("Set-Cookie:", headers.cookie);
      } else {
        console.error("Failed to extract Set-Cookie.");
        return;
      }
    }

    // 第二次请求，使用提取的 Cookie
    const response = await axios.get(url, { headers });

    console.log("Response Status:", response.status);
    console.log("Data:", response.data);
  } catch (error) {
    const response = (error as any).response;
    console.error("Request failed:", response?.status);
  }
}

fetchCookie();
