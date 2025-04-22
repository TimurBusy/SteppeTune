import dotenv from "dotenv";
dotenv.config();

// 📦 Импорт всего пакета как CommonJS-модуль
import hardhat from "hardhat";
const { ethers } = hardhat;

async function main() {
  console.log("⏳ Starting deployment...");

  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log(`👤 Using wallet: ${deployer.address}`);
  console.log(`💰 Wallet balance: ${ethers.formatEther(balance)} ETH`);

  const HSR = await ethers.getContractFactory("HSR");
  console.log("🔧 Contract factory loaded");

  console.log("🚀 Sending deploy transaction...");
  const hsr = await HSR.deploy({ gasLimit: 3_000_000 });
  await hsr.waitForDeployment();

  console.log(`✅ Contract deployed to: ${hsr.target}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
