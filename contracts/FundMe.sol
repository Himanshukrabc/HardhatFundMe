// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "hardhat/console.sol";

error FundMe__notOwner();

contract FundMe{

    uint256 private s_fundsInContract=0;
    uint256 public constant MIN_USD=5 *1e18;

    address[] private s_funders;
    mapping(address=>uint256) private s_addressToAmtFunded;

    address private immutable i_owner;
    AggregatorV3Interface private s_priceFeed;

    constructor(address priceFeedAddress){
        i_owner=msg.sender;
        s_priceFeed=AggregatorV3Interface(priceFeedAddress);
    }

    function fund() public payable{
        uint256 valueInUSD = getConversionRate(msg.value,s_priceFeed);
        require(valueInUSD>=MIN_USD,"Not Enough funds sent");//1e18wei==1e9gwei==1ETH
        s_funders.push(msg.sender);
        s_addressToAmtFunded[msg.sender]=msg.value;
        s_fundsInContract+=msg.value;
    }

    function getPrice(AggregatorV3Interface s_PriceFeed) public view returns(uint256){
        (,int256 price,,,)=s_PriceFeed.latestRoundData();
        //the msg.value returns ether in wei units(1ETH==1e18wei)
        // thus we must also return in ans*1e18
        return uint256(price * 1e10);
    }

    function getConversionRate(uint256 ethAmount, AggregatorV3Interface s_PriceFeed) public view returns(uint256){
        uint256 ethPrice = getPrice(s_PriceFeed);
        uint256 ethAmountInUSD = (ethAmount * ethPrice)/1e18;
        return ethAmountInUSD;

    }

    function withdraw() public onlyOwner{
        for(uint256 ind=0;ind<s_funders.length;ind++){
            address funder = s_funders[ind];
            s_addressToAmtFunded[funder]=0;
        }
        // RESETING THE ARRAY
        s_funders=new address[](0);
        //new address[](x ===> this is the number of elements that already need to be present in the array)
        (bool callSuccess, /*bytes memory dataReturned*/) = payable(msg.sender).call{value:address(this).balance}("");
        require(callSuccess,"Send Failed");
    }

    function cheaperWithdraw() public onlyOwner{
        address[] memory funders = s_funders;
        for(uint256 ind=0;ind<funders.length;ind++){
            address funder = funders[ind];
            s_addressToAmtFunded[funder]=0;
        }
        // RESETING THE ARRAY
        s_funders=new address[](0);
        //new address[](x ===> this is the number of elements that already need to be present in the array)
        (bool callSuccess, /*bytes memory dataReturned*/) = payable(msg.sender).call{value:address(this).balance}("");
        require(callSuccess,"Send Failed");
    }

    modifier onlyOwner{
        if(msg.sender!=i_owner){
            revert FundMe__notOwner();
        }
        // require(i_owner==msg.sender,"Sender is not i_Owner");
        _;
    }

    function getOwner() public view returns(address){
        return i_owner;
    }

    function getFunder(uint256 index) public view returns(address){
        return s_funders[index];
    }

    function getAddressToAmtFunded(address funderAddress) public view returns(uint256){
        return s_addressToAmtFunded[funderAddress];
    }

    function getPriceFeed() public view returns(AggregatorV3Interface){
        return s_priceFeed;
    }
}