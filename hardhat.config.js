require("@nomicfoundation/hardhat-toolbox");
// Instead of creating deploy scripts, we use this for deploying our contracts
require("hardhat-deploy");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("dotenv").config();

const API_KEY = process.env.API_KEY || "";
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "";
const GOERLI_PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY || "";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            // gasPrice: 130000000000,
        },
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [`0x${GOERLI_PRIVATE_KEY}`],
            chainId: 5,
            blockConfirmations: 6,
        },
    },
    // NAMED ACCOUNTS
    // Some accounts can be named by specifying its array index on different chains.
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        },
    },
    etherscan: {
        apiKey: API_KEY,
        // customChains: [], // uncomment this line if you are getting a TypeError: customChains is not iterable

    },
    gasReporter: {
        enabled: true,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        coinmarketcap: COINMARKETCAP_API_KEY,
    },
    solidity: {
        // 0.6.6 to compile the mock
        compilers: [{ version: "0.8.17" }, { version: "0.6.6" }]
    },
};


// npm i hardhat @nomicfoundation/hardhat-toolbox hardhat-deploy hardhat-gas-reporter solidity-coverage
// npm i --save-dev @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers