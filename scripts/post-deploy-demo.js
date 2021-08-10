/* eslint-disable space-before-function-paren */
/* eslint-disable no-undef */
const { readFile } = require('fs/promises');
const FILE_PATH = './deployed.json';

async function getDeployedAddress(contractName) {
  console.log(`${contractName} deployed on ${hre.network.name}`);
  // Open and Read current FILE_PATH if exists
  let jsonString = '';
  let obj = {};
  try {
    jsonString = await readFile(FILE_PATH, 'utf-8');
    obj = JSON.parse(jsonString);
  } catch (e) {
    // If does not exist, do nothing
  }
  const deployedAddress = obj[contractName][hre.network.name];
  return deployedAddress;
}

const hre = require('hardhat');

async function main() {
  // const networkName = 'rinkeby';
  const contractName = 'Greeter';

  // IMPORTANT! il faut toujours ajouter
  // le --network rinkeby pour
  // avoir access dans l'address du deployer
  // eslint-disable-next-line max-len
  // assingé avec le clé (dans la configuration du hardhat)// Example: npx hardhat run scripts/post-deploy-Greeter.js --network rinkeby

  // deployer = defined in .env + hardhat.config.js
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);

  const deployedAddress = await getDeployedAddress(contractName);

  console.log('deployedAddress', deployedAddress);

  // We get the contract to deploy
  const MyContract = await hre.ethers.getContractFactory(contractName);

  // the contract is already deployed on the network
  // and constructor already initialised with deploy script
  const deployedcontract = await MyContract.attach(deployedAddress.address);
  console.log('verify contract address:', deployedcontract.address);

  // Contract is automatically connected (signed) with deployer (his key is in the configuration file)
  console.log('signer', deployedcontract.signer.address);

  // create new connection & transactio with Josh
  const Josh = '0x586DFCa72e32f1b5382624A689fe6078E65166F3';
  const connection = await deployedcontract.connect(Josh);
  console.log('signer', connection.signer.address);
  const senderOfTransaction = await connection.getConnectedAddress();
  console.log('sender', senderOfTransaction);

  if (hre.network.name !== 'mainnet') {
    console.log('hey');

    // DEMO UPDATING DATA ON BLOCKCHAIN
    // const greet1 = await deployedcontract.greet();
    // console.log('greet1', greet1); // OLD MESSAGE
    // const tx = await deployedcontract.setGreeting('Back to old message!!!');
    // await tx.wait();
    // const greet2 = await deployedcontract.greet();
    // console.log('greet2', greet2);

    // const Signer = deployedcontract.signer.address;
  }

  // if (hre.network.name !== 'mainnet') {
  //   await dsToken.approve('0xC581402eb71C9f0a3e9b8c1B578116D9264C9ACd', 10000000000);
  //   console.log(
  //     (await dsToken.allowance(deployer.address, '0xC581402eb71C9f0a3e9b8c1B578116D9264C9ACd')).toString(),
  //     ' : Allowance to 0xC581402eb71C9f0a3e9b8c1B578116D9264C9ACd'
  //   );
  // }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
