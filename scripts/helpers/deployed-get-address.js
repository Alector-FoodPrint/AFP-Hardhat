const { readFile } = require('fs/promises');

const FILE_PATH = './deployed.json';

exports.getDeployedAddress = async (contractName, deployedNetwork) => {
  console.log(`Trying to get ${contractName} address, deployed on ${deployedNetwork}`);
  // Open and Read current FILE_PATH if exists
  let jsonString = '';
  let obj = {};
  try {
    jsonString = await readFile(FILE_PATH, 'utf-8');
    obj = JSON.parse(jsonString);
  } catch (e) {
    console.log('ERROR in reading filepath', e.message);
    // If does not exist, do nothing
  }

  // deploywedNetwork is hre.network.name
  const deployedAddress = obj[contractName][deployedNetwork];
  return deployedAddress;
};
