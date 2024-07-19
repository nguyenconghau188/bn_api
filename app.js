require("dotenv").config();
const Binance = require("binance-api-node").default;

const client = Binance({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_API_SECRET,
});

const getAccountInfo = async () => {
  try {
    const accountInfo = await client.accountInfo();
    let totalAmount = 0;

    if (accountInfo.balances !== undefined) {
      const filterBalances = accountInfo.balances.filter((item) => {
        return parseFloat(item.free) + parseFloat(item.locked) > 0;
      });

      if (filterBalances.length > 0) {
        let dataAcount = [];

        for (const item of filterBalances) {
          const asset = item.asset;
          const freeAmount = parseFloat(item.free);
          const lockedAmount = parseFloat(item.locked);
          let assetPrice = 0;

          if (asset === "USDT") {
            totalAmount = freeAmount + lockedAmount;
          } else {
          }
        }

        console.log(filterBalances);
      }
    }

    totalAmount === 0 && console.log("account empty");
  } catch (error) {
    console.error("Error fetching account info:", error);
  }
};

const getPrice = async (assetSysbol) => {
  try {
    const price = await client.prices({ assetSysbol });
    return parseFloat(price[assetSysbol]);
  } catch (error) {
    console.error(`Error fetching price for ${assetSysbol}:`, error);
    return 0;
  }
};

getAccountInfo();
