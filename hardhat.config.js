require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const {
  INFURA_API_URL,
  ETHERSCAN_API_KEY,
  LOCAL_HARDHAT_PRIVATE_KEY,
  TESTNET_SEPOLIA_PRIVATE_KEY,
} = process.env;

module.exports = {
  solidity: "0.7.3",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    local: {
      url: "http://localhost:8545",
      accounts: [LOCAL_HARDHAT_PRIVATE_KEY],
    },
    sepolia: {
      url: INFURA_API_URL,
      accounts: [TESTNET_SEPOLIA_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};
