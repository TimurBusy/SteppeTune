// scripts/checkNetwork.js
import { ethers, network } from "hardhat/config";

async function main() {
  const blockNumber = await ethers.provider.getBlockNumber();
  console.log(`✅ Сеть: ${network.name}`);
  console.log(`📦 Текущий номер блока: ${blockNumber}`);
}

main().catch((err) => {
  console.error("❌ Ошибка:", err);
  process.exit(1);
});
