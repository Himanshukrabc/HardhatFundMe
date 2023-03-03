const { network } = require("hardhat");
const { developmentChains, DECIMALS, INITIAL_ANSWER } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    if(developmentChains.includes(network.name)){
        log("Local network detected, deploying mocks...");
        await deploy("MockV3Aggregator",{
            contract:"MockV3Aggregator",
            from:deployer,
            log:true,
            args:[DECIMALS, INITIAL_ANSWER]//check from implementation
        });
        log("Mock scripts deployed.");
        log("-------------------------------------------------------------------");
    }
}

// if we specify --tags as specified in the 
// npm hardhat deploy --tags <val>
// This script will run only when the given tags are specified.
module.exports.tags = ["all","mocks"];