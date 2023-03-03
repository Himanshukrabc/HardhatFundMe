const { deployments, ethers, getNamedAccounts } = require('hardhat');
const { assert, expect } = require('chai');

describe("FundMe", function () {
    let fundme, MockV3Aggregator;
    let deployer;
    const sendAmt = ethers.utils.parseEther("1");//===1ETH otherwise we will have to use 1000000000000000000 (= 1e18)
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
        fundme = await ethers.getContract("FundMe", deployer);
        MockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
    })

    describe("constructor", function () {
        it("Sets the aggregator address correctly", async function () {
            // All variables become getter functions with same name
            const response = await fundme.priceFeed();
            assert.equal(response, MockV3Aggregator.address);
        })
    })

    describe("fund", function () {
        it("Fails if not enough ETH sent", async function () {
            await expect(fundme.fund()).to.be.revertedWith("Not Enough funds sent");
        })
        it("updates amtFunded", async function () {
            await fundme.fund({ value: sendAmt });
            const response = await fundme.addressToAmtFunded(deployer);
            assert.equal(response.toString(), sendAmt.toString());
        })
        it("adds funder to funders array", async function () {
            await fundme.fund({ value: sendAmt });
            const response = await fundme.funders(0);
            assert.equal(response, deployer);
        })
    })

    describe("withdraw", function () {
        beforeEach(async function () {
            await fundme.fund({ value: sendAmt });
        })
        it("Withdraws ETH from a single funder", async function () {
            // Arrange
            const startFundMeBalance = await fundme.provider.getBalance(fundme.address);
            const startDeployerBalance = await fundme.provider.getBalance(deployer);
            // Act
            const txnResponse = await fundme.withdraw();
            const txnReciept = await txnResponse.wait(1);
            const { gasUsed, effectiveGasPrice } = txnReciept;
            const gasCost = gasUsed.mul(effectiveGasPrice); 
            const endFundMeBalance = await fundme.provider.getBalance(fundme.address);
            const endDeployerBalance = await fundme.provider.getBalance(deployer);
            // Assert
            assert.equal(endFundMeBalance, 0);
            assert.equal(endDeployerBalance.add(gasCost).toString(), startDeployerBalance.add(startFundMeBalance).toString());//big numbers need to use .add()
        })
    })
})