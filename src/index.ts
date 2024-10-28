import { gmgnMain } from "./gmgn_smart_address";
import { okxMain } from "./okx_smart_address";
import { createBrowser } from "./proxy/puppeteer";
import { formattedDate } from "./utils/tools";

const oneHourInMilliseconds = 60 * 60 * 1000;
setInterval(async () => {
  const browser = await createBrowser(false);
  const time = formattedDate();
  console.log(`start run ${time}`);
  try {
    await gmgnMain(browser);
    await okxMain(browser);
  } catch (error) {
    console.log(`start run ${error}`);
  } finally {
    await browser.close();
  }
}, oneHourInMilliseconds);

// gmgnMain().catch(console.error);
// okxMain().catch(console.error);
