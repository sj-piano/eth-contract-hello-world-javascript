# Ethereum (ETH) smart contract "Hello World" in Javascript


## Installation


Requirements:  
- NodeJS  
- NPM  
- Etherscan API key
- Infura API key


```bash

git clone git@github.com:sj-piano/eth-contract-hello-world-javascript.git

cd eth-contract-hello-world-javascript

```

For development (i.e. you want to be able to run the tests on a local node):  
`npm install --include=dev`

For production (i.e. you only need the contract itself, together with scripts for deploying and communicating with it on testnet or mainnet):  
`npm install`


Install Taskfile.dev  
https://taskfile.dev/installation


## Setup

Copy the file `.env.example` to `.env` and fill it in with the relevant values.


## Operation

Run `task --list` to see available commands. Shorter command: `task -l`

Run a task. Example: `task hello`


## Notes:

The local development node is Hardhat.