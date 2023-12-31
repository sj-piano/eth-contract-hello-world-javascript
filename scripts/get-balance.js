// Imports
const Big = require("big.js");
const { program } = require("commander");
const { ethers } = require("ethers");
const fs = require("fs");
const Joi = require("joi");
const _ = require("lodash");

// Local imports
const { config } = require("#root/config.js");
const ethereum = require("#root/src/ethereum.js");
const { createLogger } = require("#root/lib/logging.js");

// Load environment variables
require("dotenv").config();
const { INFURA_API_KEY_NAME } = process.env;

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
  )
  .option("--address <address>", "Ethereum address.")
  .option(
    "--address-file <addressFile>",
    "Path to file containing Ethereum address."
  );
program.parse();
const options = program.opts();
if (options.debug) console.log(options);
let { debug, logLevel, network: networkLabel, address, addressFile } = options;

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

if ((address && addressFile) || (!address && !addressFile)) {
  console.error(
    "Please provide either '--address' or '--address-file', but not both."
  );
  program.help(); // Display help and exit
}
if (addressFile && !fs.existsSync(addressFile)) {
  var msg = `Address file not found: ${addressFile}`;
  console.error(msg);
  process.exit(1);
}

if (addressFile && fs.existsSync(addressFile)) {
  address = fs.readFileSync(addressFile).toString().trim();
  deb(`Address found in ${addressFile}: ${address}`);
}
if (!ethers.isAddress(address)) {
  var msg = `Invalid Ethereum address: ${address}`;
  console.error(msg);
  process.exit(1);
}

// Setup

let provider;

var msg;
if (networkLabel == "local") {
  msg = `Connecting to local network at ${network}...`;
  provider = new ethers.JsonRpcProvider(network);
} else if (networkLabel == "testnet") {
  msg = `Connecting to Sepolia testnet...`;
  provider = new ethers.InfuraProvider(network, INFURA_API_KEY_NAME);
} else if (networkLabel == "mainnet") {
  msg = `Connecting to Ethereum mainnet...`;
  provider = new ethers.InfuraProvider(network, INFURA_API_KEY_NAME);
}
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
  let blockNumber = await provider.getBlockNumber();
  deb(`Current block number: ${blockNumber}`);

  let balanceWei = await provider.getBalance(address);
  let balanceEth = ethers.formatEther(balanceWei);
  let ethToUsd = await ethereum.getEthereumPriceInUsd({ logger, config });
  let balanceUsd = (Big(balanceEth) * Big(ethToUsd)).toFixed(config.USD_DP);

  let msg = `${balanceEth} ETH (${balanceUsd} USD)`;
  console.log(msg);
}
