/* eslint-disable space-before-function-paren */
/* eslint-disable no-undef */

/*
RUN LIKE THIS:
1st: npx hardhat compile
2nd: npx hardhat run scripts/AFA-deploy.js --network rinkeby 

*/
const hre = require('hardhat');
const { deployed } = require('./helpers/deployed');
const { getDeployedAddress } = require('./helpers/deployed-get-address');

async function main() {
  const currentContract = 'AFA';
  // const coinName = 'ThemisCoin';

  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);

  // We get the contract to deploy

  // ! IMPORTANT. If you need the address of deployed coin
  // const coinAddress = await getDeployedAddress(coinName, hre.network.name);
  // console.log('Use the coin is deployed in address:', coinAddress.address);

  const MyContract = await hre.ethers.getContractFactory(currentContract);
  const mycontract = await MyContract.deploy();
  await mycontract.deployed();

  // !IMPORTANT. This is Alyra custom function
  // in order to save deployed addresses to deployed.json
  await deployed(currentContract, hre.network.name, mycontract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
