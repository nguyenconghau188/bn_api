require("dotenv").config();
const schedule = require("node-schedule");
const Binance = require("binance-api-node").default;

const client = Binance({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_API_SECRET,
});

const getAccountInfo = async () => {
  try {
    const accountInfo = await client.accountInfo();
    let totalAmountSpotAccount = 0;

    if (accountInfo.balances !== undefined) {
      const filterBalances = accountInfo.balances.filter((item) => {
        return parseFloat(item.free) + parseFloat(item.locked) > 0.05;
      });

      const btcPrice = await getPrice("BTCUSDT");

      if (filterBalances.length > 0) {
        let dataTokenSpot = [];

        for (const item of filterBalances) {
          const asset = item.asset;
          const freeAmount = parseFloat(item.free);
          const lockedAmount = parseFloat(item.locked);
          const totalAmount = freeAmount + lockedAmount;
          let assetPrice = 0;

          if (asset === "USDT") {
            assetPrice = 1;
          } else {
            assetPrice = await getPrice(asset + "USDT");
          }
          totalValueOfThisAsset = assetPrice * totalAmount;

          if (totalValueOfThisAsset > 1) {
            totalAmountSpotAccount += totalValueOfThisAsset;

            dataTokenSpot = [
              ...dataTokenSpot,
              {
                token_name: asset,
                token_price: assetPrice,
                total_token: totalAmount,
                // free_token: freeAmount,
                // locked_token: lockedAmount,
                total_value_token: totalValueOfThisAsset,
              },
            ];
          }
        }

        const dataAccount = {
          total_amount_spot_account: totalAmountSpotAccount,
          BTCUSDT: btcPrice,
          data_spot: dataTokenSpot,
        };

        console.log(
          "\n====================================================================="
        );
        console.log("Trigger at:", getCurrentTime());
        console.log(dataAccount);
        console.log(
          "\n====================================================================="
        );
      }
    }

    totalAmountSpotAccount === 0 && console.log("account empty");
  } catch (error) {
    console.error("Error fetching account info:", error);
  }
};

const getPrice = async (symbol) => {
  try {
    const price = await client.prices({ symbol });
    return parseFloat(price[symbol]);
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return 0;
  }
};

const getCurrentTime = () => {
  const now = new Date();

  // Year (4 digits)
  const year = now.getFullYear();

  // Month (0-indexed, so adjust for human-readable format)
  const month = String(now.getMonth() + 1).padStart(2, "0");

  // Day (2 digits)
  const day = String(now.getDate()).padStart(2, "0");

  // Hours (2 digits, 24-hour format)
  const hours = String(now.getHours()).padStart(2, "0");

  // Minutes (2 digits)
  const minutes = String(now.getMinutes()).padStart(2, "0");

  // Seconds (2 digits)
  const seconds = String(now.getSeconds()).padStart(2, "0");

  // Format the datetime string
  const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  return formattedDateTime;
};

getAccountInfo();

const job = schedule.scheduleJob("*/1 * * * *", getAccountInfo);
console.log("Function scheduled to run every minute.");
