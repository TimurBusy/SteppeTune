import dotenv from "dotenv";
dotenv.config();

import hardhat from "hardhat";
const { ethers } = hardhat;

async function main() {
  console.log("🎵 Получаем все песни из контракта...");

  const [caller] = await ethers.getSigners();
  const contractAddress = process.env.CONTRACT_ADDRESS;

  const HSR = await ethers.getContractFactory("HSR");
  const hsr = await HSR.attach(contractAddress);

  const total = await hsr.getNumSongs();
  console.log(`📦 Всего песен: ${total}`);

  for (let i = 1; i <= total; i++) {
    try {
      const details = await hsr.getSongDetails(i);
      console.log(`🎶 Песня ID ${i}`);
      console.log(`   ▶️ Название: ${details[0]}`);
      console.log(`   🎤 Артист: ${details[1]}`);
      console.log(`   🎼 Жанр: ${details[2]}`);
      console.log(`   🔑 Хэш: ${details[3]}`);
      console.log(`   💸 Цена: ${ethers.formatEther(details[4])} ETH`);
      console.log(`   🛒 Куплено раз: ${details[5]}`);
      console.log("--------------------------------------------------");
    } catch (err) {
      console.warn(`⚠️ Ошибка при чтении песни ${i}:`, err.message);
    }
  }
}

main().catch((err) => {
  console.error("❌ Ошибка выполнения:", err);
  process.exit(1);
});
