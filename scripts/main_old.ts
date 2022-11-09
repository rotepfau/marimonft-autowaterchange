import { ethers, utils, BigNumber } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();
import config from "../config.json";

const provider = new ethers.providers.WebSocketProvider(
   process.env.ALCHEMY_APIKEY!,
   1
);

const marimoAddress = "0xA35aa193f94A90eca0AE2a3fB5616E53C1F35193";

const marimoAbi = [
   "function tokensOfOwner(address) view returns (uint256[])",
   "function getElapsedTimeFromLastWaterChanged(uint256 tokenId) public view returns (uint256)",
   "function changeWater(uint256 tokenId) external",
];

const marimoContract = new ethers.Contract(marimoAddress, marimoAbi, provider);

let ownedMarimos, dirtinessThreshold;

const main = async () => {
   console.log("# Setting up...");
   await setup();
   console.log("# Listening...");
   provider.on("block", checkLife);
};

let alreadyChecking = false;
let needChangeWater = false;
let inChange = false;

const checkLife = async (bh) => {
   if (alreadyChecking === true) return;
   console.log("# Checking life...");
   if (needChangeWater === true) {
      console.log("needs water change");
      const gasPrice = (await provider.getFeeData()).gasPrice;
      if (
         inChange ||
         gasPrice?.gte(utils.parseUnits(config.gasPrice, "gwei"))
      ) {
         console.log(
            "gas price too high, waiting drop below of",
            config.gasPrice
         );
         return;
      }
      inChange = true;
      await new Promise((r) => setTimeout(r, 20000));
      inChange = false;
      needChangeWater = false;
      return;
   }
   alreadyChecking = true;
   console.log("bh:", bh);
   for (let i = 0; i < ownedMarimos.length; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const timeElapsed = Number(
         utils.formatUnits(
            await marimoContract.getElapsedTimeFromLastWaterChanged(
               ownedMarimos[i]
            ),
            0
         )
      );
      if (timeElapsed > 60 * 60 * 24 * dirtinessThreshold) {
         needChangeWater = true;
      }
   }
   alreadyChecking = false;
};

const setup = async () => {
   ownedMarimos = await marimoContract.tokensOfOwner(
      "0xE7d87Ec87a016D6d5AA366aa7E4D31c5D2d4D1E4"
   );
   dirtinessThreshold = 100 - config.clarityPercentThreshold;
};

main().catch((err) => {
   console.log(err);
   process.exit(1);
});
