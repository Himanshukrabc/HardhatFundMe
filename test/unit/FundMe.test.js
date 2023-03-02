const { deployments, ethers, getNamedAccounts } = require('hardhat');
const { assert } = require('chai');

describe("FundMe", function () {
    let fundme, MockV3Aggregator;
    let deployer;
    beforeEach(async function () {
        // deploying fundme contract using hardhat-deploy

        // const acounts = await ethers.getSigners(); //==> gets all the accounts for the given chain in array format
        // OR
        deployer = (await getNamedAccounts()).deployer;

        // fixture() ==> it enables tests to execute on the previously deloyed contract itself
        // This allows us to escape deploying contract everytime before running any test.
        // the list of tags indicates which tagged contracts are to be deployed.
        await deployments.fixture(["all"]);

        // gives us the latest deployed contract ==> getContract doesnot work on hardhat. This is a workaround
        fundme = await ethers.getContract("FundMe",deployer);
        MockV3Aggregator = await ethers.getContract("MockV3Aggregator",deployer);
    })

    describe("constructor", function () {
        it("Sets the aggregator address correctly", async function () {
            // All variables become getter functions with same name
            const response = await fundme.priceFeed();
            assert.equal(response, MockV3Aggregator.address);
        })
    })
})