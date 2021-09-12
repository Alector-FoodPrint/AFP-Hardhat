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

const USERS = [
  {
    hash: '0xaa7008c660b0b36576adba8df972ca071c731ea3',
    name: 'Florent X.',
    role: 'producer',
  },
  {
    hash: '0x429dcf7b3b61036a8f9f1c58e6664a32d2167e43',
    name: 'Ricardo M.',
    role: 'warehouse',
  },
  {
    hash: '0xd5de4cf988a87cd29c74b153b48ff9a3ed9cb6cd',
    name: 'Giannis P.',
    role: 'vendor',
  },
  {
    hash: '0x9e92313f53b84d64e1903aefd4dd73088a7e781c',
    name: 'Elevage Verte',
    role: 'producer',
  },
  {
    hash: '0xf5c846a26aca6fdbb6e3beb5b9a69d1162a303f5',
    name: 'Adette M.',
    role: 'warehouse',
  },
  {
    hash: '0x64e1d13f9e68cd76cff84f43b105907ef7150317',
    name: 'Vertikos L.',
    role: 'vendor',
  },
];

const FOOD_TYPES = [
  { name: 'Tomatoes', unit: 'Kg', subtypes: ['Standard', 'Biological', 'Greenhouse'] },
  { name: 'Potatoes', unit: 'Kg', subtypes: ['Standard', 'Biological', 'Greenhouse'] },
  { name: 'Eggs', unit: 'Items', subtypes: ['Standard', 'Free-Run', 'Organic'] },
  { name: 'Milk', unit: 'Lt', subtypes: ['whole (3.25%)', 'reduced-fat (2%)', 'low-fat milk (1%)', 'fat-free'] },
];

const hre = require('hardhat');

async function main() {
  // const networkName = 'rinkeby';
  const contractName = 'AFA';

  // IMPORTANT! il faut toujours ajouter
  // le --network rinkeby pour
  // avoir access dans l'address du deployer
  // eslint-disable-next-line max-len
  // assingé avec le clé (dans la configuration du hardhat)// Example: npx hardhat run scripts/AFA-post-deploy.js --network rinkeby

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

  const admin = '0x2FAA5d599e9aC5d1a5092a6e1b1C7FC7DCBDAC45';
  const connection = await deployedcontract.connect(admin);
  console.log('signer', connection.signer.address);

  if (hre.network.name !== 'mainnet') {
    console.log('hey');

    // test basic functionality (print contract name)
    const name = await deployedcontract.name();
    console.log('Contract Name:', name); // OLD MESSAGE

    for (const user of USERS) {
      const account = user['hash'];
      const role = user['role'];

      if (role === 'producer') {
        console.log('Add Producer: ', account);
        let tx = await deployedcontract.addProducer(account);
        await tx.wait();
      }
      if (role === 'warehouse') {
        console.log('Add Warehouse: ', account);
        tx = await deployedcontract.addWarehouse(account);
        await tx.wait();
      }
      if (role === 'vendor') {
        console.log('Add Vendor: ', account);
        tx = await deployedcontract.addVendor(account);
        await tx.wait();
      }
    }

    console.log('Add 100 Kilos of Tomatos (Biological) to Florent X');
    tx = await deployedcontract.AdminProduce(100, 0, 1, '0xaa7008c660b0b36576adba8df972ca071c731ea3');
    await tx.wait();

    console.log('Add 300 Kilos of Potatoes (Standard) to Florent X');
    tx = await deployedcontract.AdminProduce(200, 1, 0, '0xaa7008c660b0b36576adba8df972ca071c731ea3');
    await tx.wait();

    console.log('Add 500 Eggs  (Free-Run) to Elevage Verte');
    tx = await deployedcontract.AdminProduce(500, 2, 1, '0x9e92313f53b84d64e1903aefd4dd73088a7e781c');
    await tx.wait();

    console.log('Add 50 Lt  Milk (reduced-fat (2%)) to Elevage Verte');
    tx = await deployedcontract.AdminProduce(50, 3, 1, '0x9e92313f53b84d64e1903aefd4dd73088a7e781c');
    await tx.wait();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
