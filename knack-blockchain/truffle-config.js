module.exports = {
  networks: {
      development: {
          host: "127.0.0.1",   // Локальный хост
          port: 8545,          // Порт Ganache
          network_id: "*",     // Любая сеть
      }
  },
  compilers: {
      solc: {
          version: "0.8.19",   // Указываем версию Solidity
      }
  }
};
