
// we export deploy functions that are called by hardhat-deploy module

const { network } = require("hardhat");
const { networkConfig, developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

// module.exports.default = (hre)=>{
// {getNamedAccounts, deployments} = hre
module.exports.default = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    // namedAccounts ==> see hardhat.config
    const chainId = network.config.chainId;

    // We cant directly deploy our fundme contract as it has a dependency on an oracle.
    // This oracle is specific to the goerli network and cannot be used for local testing
    // For local testing, we need to use mocking.

    // MOCKING
    // It is primarily used for unit testing. An object under test may have dependencies on many other objects
    // To isolate its behaviour, we replace other objects by mocks which simulate their behaviour.
    // ===> when using localhost or hardhat network, we need to use a mock
    // ===> we also need a way to change the address for different chains, to get pricefeed.
    //      ===> we get the pricefeed address as a constructor parameter.
    let priceFeedAddress;
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        priceFeedAddress = ethUsdAggregator.address;
    }
    else priceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];

    const fundme = await deploy("FundMe", {
        from: deployer,
        args: [priceFeedAddress],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })
    log("--------------------------------------------------------------------");

    if (!developmentChains.includes(network.name) && process.env.API_KEY) {
        await verify(fundme.address, [priceFeedAddress]);
    }
}

module.exports.tags = ["all","fundme"];
