import * as dotenv from "dotenv";
import "@nomicfoundation/hardhat-ethers";

dotenv.config();

export default {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
