// Imports
const Big = require("big.js");
const { program } = require("commander");
const { ethers } = require("ethers");
const Joi = require("joi");
const _ = require("lodash");

// Local imports
const { config } = require("#root/config.js");
const ethereum = require("#root/src/ethereum.js");
const { createLogger } = require("#root/src/logging.js");

// Controls
const initialMessage = "Hello World!";

// Load environment variables
require("dotenv").config();
const {
  INFURA_API_KEY,
  LOCAL_HARDHAT_PRIVATE_KEY,
  LOCAL_HARDHAT_ADDRESS,
  TESTNET_SEPOLIA_PRIVATE_KEY,
  TESTNET_SEPOLIA_ADDRESS,
} = process.env;

// Logging
const { logger, log, deb } = createLogger();

// Parse arguments
program
  .option("-d, --debug", "log debug information")
  .option("--log-level <logLevel>", "Specify log level.", "error")
  .option(
    "--network <network>",
    "specify the Ethereum network to connect to",
    "local"
  );
program.parse();
const options = program.opts();
if (options.debug) log(options);
let { debug, logLevel, network: networkLabel } = options;

// Process and validate arguments

const logLevelSchema = Joi.string().valid(...config.logLevelList);
let logLevelResult = logLevelSchema.validate(logLevel);
if (logLevelResult.error) {
  var msg = `Invalid log level "${logLevel}". Valid options are: [${config.logLevelList.join(
    ", "
  )}]`;
  console.error(msg);
  process.exit(1);
}
if (debug) {
  logLevel = "debug";
}
logger.setLevel({ logLevel });

const networkLabelSchema = Joi.string().valid(...config.networkLabelList);
let networkLabelResult = networkLabelSchema.validate(networkLabel);
if (networkLabelResult.error) {
  var msg = `Invalid network "${networkLabel}". Valid options are: [${config.networkLabelList.join(
    ", "
  )}]`;
  console.error(msg);
  process.exit(1);
}
const network = config.mapNetworkLabelToNetwork[networkLabel];

// Setup

const contract = require("../artifacts/contracts/HelloWorld.sol/HelloWorld.json");

let provider, signer;

var msg;
if (networkLabel == "local") {
  msg = `Connecting to ${networkLabel} network at ${network}...`;
  provider = new ethers.JsonRpcProvider(network);
  signer = new ethers.Wallet(LOCAL_HARDHAT_PRIVATE_KEY, provider);
} else if (networkLabel == "testnet") {
  msg = `Connecting to ${networkLabel} ${network} network...`;
  provider = new ethers.InfuraProvider(network, INFURA_API_KEY);
  signer = new ethers.Wallet(TESTNET_SEPOLIA_PRIVATE_KEY, provider);
} else if (networkLabel == "mainnet") {
  throw new Error("Not implemented yet");
}
let contractFactoryHelloWorld = new ethers.ContractFactory(
  contract.abi,
  contract.bytecode,
  signer
);
log(msg);

// Run main function

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// Functions

async function main() {
  // Estimate fees.
  // - Stop if any fee limit is exceeded.
  const txRequest = await contractFactoryHelloWorld.getDeployTransaction(
    initialMessage
  );
  const estimatedFees = await ethereum.estimateFees({
    config,
    logger,
    provider,
    txRequest,
  });
  deb(estimatedFees);
  const {
    gasLimit,
    maxFeePerGasWei,
    maxPriorityFeePerGasWei,
    feeEth,
    feeUsd,
    feeLimitChecks,
  } = estimatedFees;
  log(`Estimated fee: ${feeEth} ETH (${feeUsd} USD)`);
  if (feeLimitChecks.anyLimitExceeded) {
    for (let key of feeLimitChecks.limitExceededKeys) {
      let check = feeLimitChecks[key];
      console.error(`- ${key}: ${check.msg}`);
    }
    process.exit(1);
  }
  const gasPrices = estimatedFees.gasPrices;
  const { ethToUsd } = gasPrices;

  // Get ETH balance of signer.
  // - Stop if balance is too low.
  const signerAddress = await signer.getAddress();
  const signerBalanceWei = await provider.getBalance(signerAddress);
  const signerBalanceEth = ethers.formatEther(signerBalanceWei);
  const signerBalanceUsd = Big(ethToUsd)
    .mul(Big(signerBalanceEth))
    .toFixed(config.USD_DP);
  log(`Signer balance: ${signerBalanceEth} ETH (${signerBalanceUsd} USD)`);
  if (Big(signerBalanceEth).lt(Big(feeEth))) {
    console.error(`Signer balance is too low. Need at least ${feeEth} ETH.`);
    process.exit(1);
  }

  // Deploy contract.
  // - Use the estimated fee values.
  // - Wait for deployment to complete.
  const contractHelloWorld = await contractFactoryHelloWorld.deploy(
    initialMessage,
    {
      gasLimit,
      maxFeePerGas: maxFeePerGasWei,
      maxPriorityFeePerGas: maxPriorityFeePerGasWei,
    }
  );
  await contractHelloWorld.waitForDeployment();

  // Examine the results and find out how much was spent.
  const txDeployment = contractHelloWorld.deploymentTransaction();
  deb(txDeployment);
  const txReceipt = await txDeployment.wait();
  deb(txReceipt);
  const { gasUsed, gasPrice: effectiveGasPrice } = txReceipt;
  deb(`Gas used: ${gasUsed} wei`);
  deb(`Effective gas price: ${effectiveGasPrice} wei`);

  const txFeeWei = txReceipt.fee;
  deb(`txFeeWei: ${txFeeWei}`);
  const txFeeEth = ethers.formatEther(txFeeWei).toString();
  const txFeeUsd = Big(ethToUsd).mul(Big(txFeeEth)).toFixed(config.USD_DP);
  log(`Final fee: ${txFeeEth} ETH (${txFeeUsd} USD)`);

  // Report the final result.
  let contractAddress = contractHelloWorld.target;
  log(`Contract deployed to address:`);
  console.log(contractAddress);
}