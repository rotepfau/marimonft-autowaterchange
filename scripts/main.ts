import { ethers, utils } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();
import config from "../config.json";

const provider = new ethers.providers.WebSocketProvider(
   process.env.WSS_APIKEY!,
   1
);

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

const marimoAddress = "0xA35aa193f94A90eca0AE2a3fB5616E53C1F35193";

const marimoAbi = [
   "function tokensOfOwner(address) view returns (uint256[])",
   "function getElapsedTimeFromLastWaterChanged(uint256 tokenId) public view returns (uint256)",
   "function changeWater(uint256 tokenId) external",
];

const marimoContract = new ethers.Contract(marimoAddress, marimoAbi, wallet);

let ownedMarimos: Array<number>, dirtinessThreshold: number;

const main = async () => {
   console.log("# Setting up...");
   await setup();
   console.log("# Listening...");
   await checkLife();
};

const checkLife = async () => {
   await new Promise((r) => setTimeout(r, 5000));
   try {
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice;
      const gasThreshold = utils.parseUnits(config.gasPrice, "gwei");
      if (gasPrice?.gt(gasThreshold)) {
         console.log("gas too expensive");
         return await checkLife();
      }
      for (let i = 0; i < ownedMarimos.length; i++) {
         const timeElapsed = Number(
            utils.formatUnits(
               await marimoContract.getElapsedTimeFromLastWaterChanged(
                  ownedMarimos[i]
               ),
               0
            )
         );
         if (timeElapsed < 60 * 60 * 24 * dirtinessThreshold) {
            console.log("marimo life is good");
            continue;
         }
         //logic
         console.log("changing marimo water");
         const tx = await marimoContract.changeWater(ownedMarimos[i], {
            gasPrice: gasThreshold,
            gasLimit: 300000,
         });
         await tx.wait();
      }
      await checkLife();
   } catch (err) {
      console.log(err);
      await checkLife();
   }
};

const setup = async () => {
   ownedMarimos = await marimoContract.tokensOfOwner(wallet.address);
   console.log(`you have ${ownedMarimos.length} marimo(s):\n${ownedMarimos}`);
   dirtinessThreshold = 100 - config.clarityPercentThreshold;
};

main().catch((err) => {
   console.log(err);
   process.exit(1);
});
