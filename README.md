<a name="readme-top"></a>

<!-- PROJECT SHIELDS -->
<!--
*** We use markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![AGPL V3 License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]


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


<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[license-shield]: https://img.shields.io/github/license/sj-piano/eth-contract-hello-world-javascript.svg?style=for-the-badge
[license-url]: https://github.com/sj-piano/eth-contract-hello-world-javascript/blob/main/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/stjohnpiano
