// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

// Import your TestUSD contract
import "./TestUSD.sol";

// Paper Trading Contract - Simple Flow
contract PaperTradingExchange is Ownable, ReentrancyGuard {
    IERC20 public weth;
    TestUSD public testUSD;
    AggregatorV3Interface internal ethPriceFeed;

    // Track user's WETH deposits (their maximum withdrawal limit)
    mapping(address => uint256) public userWETHDeposits;

    // Events
    event WETHDeposited(address indexed user, uint256 wethAmount, uint256 testUSDMinted, uint256 ethPrice);
    event TestUSDRedeemed(address indexed user, uint256 testUSDAmount, uint256 wethWithdrawn, uint256 ethPrice);

    constructor(
        address _weth,
        address _testUSD,
        address _ethPriceFeed,
        address _owner
    ) Ownable(_owner) {
        weth = IERC20(_weth);
        testUSD = TestUSD(_testUSD);
        ethPriceFeed = AggregatorV3Interface(_ethPriceFeed);
    }

    // Get latest ETH price from Chainlink
    function getLatestETHPrice() public view returns (uint256) {
        (, int256 price, , , ) = ethPriceFeed.latestRoundData();
        require(price > 0, "Invalid price");

        // Chainlink ETH/USD price feed returns price with 8 decimals
        // Convert to 6 decimals to match TestUSD
        return uint256(price) / 100;
    }

    // Step 1: Deposit WETH → Get TestUSD
    function depositWETH(uint256 wethAmount) external nonReentrant {
        require(wethAmount > 0, "Amount must be greater than 0");
        require(weth.balanceOf(msg.sender) >= wethAmount, "Insufficient WETH balance");
        require(weth.allowance(msg.sender, address(this)) >= wethAmount, "Insufficient allowance");

        uint256 ethPrice = getLatestETHPrice();
        // WETH has 18 decimals, TestUSD has 6 decimals
        uint256 testUSDAmount = (wethAmount * ethPrice) / 1e18;

        // Transfer WETH from user to contract (held in escrow)
        weth.transferFrom(msg.sender, address(this), wethAmount);

        // Track user's deposit (this sets their withdrawal limit)
        userWETHDeposits[msg.sender] += wethAmount;

        // Mint TestUSD to user
        testUSD.mint(msg.sender, testUSDAmount);

        emit WETHDeposited(msg.sender, wethAmount, testUSDAmount, ethPrice);
    }

    // Step 3: Redeem TestUSD → Withdraw WETH
    function redeemTestUSD(uint256 testUSDAmount) external nonReentrant {
        require(testUSDAmount > 0, "Amount must be greater than 0");
        require(testUSD.balanceOf(msg.sender) >= testUSDAmount, "Insufficient TestUSD balance");

        uint256 ethPrice = getLatestETHPrice();
        // Calculate how much WETH they should get at current price
        uint256 wethToWithdraw = (testUSDAmount * 1e18) / ethPrice;

        // Key constraint: Can never withdraw more than they deposited
        require(wethToWithdraw <= userWETHDeposits[msg.sender], "Cannot withdraw more than deposited");
        require(weth.balanceOf(address(this)) >= wethToWithdraw, "Insufficient WETH in contract");

        // Update user's deposit tracking
        userWETHDeposits[msg.sender] -= wethToWithdraw;

        // Burn TestUSD from user
        testUSD.burn(msg.sender, testUSDAmount);

        // Transfer WETH to user
        weth.transfer(msg.sender, wethToWithdraw);

        emit TestUSDRedeemed(msg.sender, testUSDAmount, wethToWithdraw, ethPrice);
    }

    // === View functions ===
    function getTestUSDValueInWETH(address user) external view returns (uint256) {
        uint256 testUSDBalance = testUSD.balanceOf(user);
        if (testUSDBalance == 0) return 0;

        uint256 ethPrice = getLatestETHPrice();
        return (testUSDBalance * 1e18) / ethPrice;
    }

    function getUserPnL(address user) external view returns (int256) {
        uint256 testUSDBalance = testUSD.balanceOf(user);
        if (testUSDBalance == 0) return 0;

        uint256 currentValueInWETH = this.getTestUSDValueInWETH(user);
        uint256 deposited = userWETHDeposits[user];

        return int256(currentValueInWETH) - int256(deposited);
    }

    function getMaxWithdrawableWETH(address user) external view returns (uint256) {
        return userWETHDeposits[user];
    }

    function getRedeemableWETH(address user) external view returns (uint256) {
        uint256 testUSDBalance = testUSD.balanceOf(user);
        if (testUSDBalance == 0) return 0;

        uint256 ethPrice = getLatestETHPrice();
        uint256 wethValue = (testUSDBalance * 1e18) / ethPrice;

        uint256 maxWithdrawable = userWETHDeposits[user];
        return wethValue > maxWithdrawable ? maxWithdrawable : wethValue;
    }

    // Emergency
    function emergencyWithdrawWETH(uint256 amount) external onlyOwner {
        require(weth.balanceOf(address(this)) >= amount, "Insufficient WETH");
        weth.transfer(owner(), amount);
    }
}
