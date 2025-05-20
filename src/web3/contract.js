import { ethers } from "ethers";
import HSR_ABI from "./HSR.json";

const CONTRACT_ADDRESS = "0xE7b72Ba69D2eA0BD8dFd247f62AC53B5BDC4918A";

export const getHSRContract = async () => {
  if (!window.ethereum) throw new Error("MetaMask не установлен");

  // ✅ Принудительно запрашиваем доступ и синхронизируем сеть
  await window.ethereum.request({ method: "eth_requestAccounts" });

  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();

  console.log("📡 Активная сеть:", network.chainId);

  if (network.chainId !== 11155111n) {
    throw new Error("❌ MetaMask не в сети Sepolia. Переключитесь!");
  }  

  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, HSR_ABI.abi, signer);

  return contract;
};
