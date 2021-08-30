/* eslint-disable comma-dangle */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

// run `$ npx hardhat test`
const { expect } = require('chai');

describe('Alector FoodPrint', () => {
  let accountNames,
    AFP,
    afp,
    dev,
    John,
    Marc,
    Bob,
    producer,
    warehouse,
    vendor,
    Alice,
    ADMIN_ROLE,
    PRODUCER_ROLE,
    PAUSER_ROLE,
    WAREHOUSE_ROLE,
    VENDOR_ROLE;
  const NAME = 'Alector FoodPrint';
  const SYMBOL = 'AFP';
  const FOOD_METRIC = ['kilo', 'grammar', 'litter'];

  const FOOD_TYPES = [
    { name: 'Tomatoes', unit: 'Kg', subtypes: ['Standard', 'Biological', 'Greenhouse'] },
    { name: 'Potatoes', unit: 'Kg', subtypes: ['Standard', 'Biological', 'Greenhouse'] },
    { name: 'Eggs', unit: 'Items', subtypes: ['Standard', 'Free-Run', 'Organic'] },
  ];

  const FOOD_ASSET_1 = {
    quantity: 100,
    foodType: 0, // Tomatoes
    foodSubtype: 1, // Biological
  };

  const FOOD_ASSET_2 = {
    quantity: 400,
    foodType: 2, // Eggs
    foodSubtype: 1, // Free-Run
  };

  const balanceArray = (max) => {
    // for max = 10, returns [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    return [...Array(max).keys()];
  };

  const ownedNftIDs = async (contract, account) => {
    const ownerBalance = await contract.balanceOf(account);

    const indexArray = balanceArray(ownerBalance.toNumber());
    const final = [];
    for (const index of indexArray) {
      const NFT_ID = await contract.tokenOfOwnerByIndex(account, index);
      final.push(NFT_ID.toNumber());
    }

    return final;
  };

  const ownedNFTs = async (contract, NFTIdList) => {
    const final = [];

    for (const id of NFTIdList) {
      const NFT = await contract.getFoodAssetById(id);
      final.push(NFT);
    }

    return final;
  };

  // const FOOD_ASSET = {
  //   active: true,
  //   foodType: 0,
  //   name: 'Tomatoes',
  //   quanity: 100,
  //   foodMetric: 0,
  //   description: 'organic tomatoes',
  //   creationDate: 11111,
  // };

  beforeEach(async function () {
    [dev, John, Marc, Bob, Alice, producer, warehouse, vendor] = await ethers.getSigners();

    accountNames = {
      '0x0000000000000000000000000000000000000000': 'ZERO_ADDRESS',
      [dev.address]: 'dev',
      [John.address]: 'John',
      [Marc.address]: 'Marc',
      [Alice.address]: 'Alice',
      [producer.address]: 'producer',
    };
    AFP = await ethers.getContractFactory('AFP');
    afp = await AFP.connect(dev).deploy();
    await afp.deployed();

    // Notes:
    // 1. Every ROLE is a public variable in AccessControl
    // 2. For every public variable we have automatically created an equivalent public function
    // 3. Every ROLE is a bytes32 uniquely identified hash created by keccak256()
    ADMIN_ROLE = await afp.ADMIN_ROLE();
    PAUSER_ROLE = await afp.PAUSER_ROLE();
    PRODUCER_ROLE = await afp.PRODUCER_ROLE();
    WAREHOUSE_ROLE = await afp.WAREHOUSE_ROLE();
    VENDOR_ROLE = await afp.VENDOR_ROLE();

    // add example for each role
    await afp.addProducer(producer.address);
    await afp.addProducer(warehouse.address);
    await afp.addProducer(vendor.address);

    // producer registers a food asset

    await afp.connect(producer).Produce(FOOD_ASSET_1.quantity, FOOD_ASSET_1.foodType, FOOD_ASSET_1.foodSubtype);
    await afp.connect(producer).Produce(FOOD_ASSET_2.quantity, FOOD_ASSET_2.foodType, FOOD_ASSET_2.foodSubtype);
  });

  describe('Deployment', async function () {
    it(`Should have name ${NAME}`, async function () {
      // console.log('afp.printRoles()', await afp.printRoles());

      expect(await afp.name()).to.equal(NAME);
    });

    it(`Should have symbol ${SYMBOL}`, async function () {
      expect(await afp.symbol()).to.equal(SYMBOL);
    });
  });

  describe('Add roles', async function () {
    it('The deployer account is already asigned with ADMIN_ROLE', async function () {
      expect(await afp.hasRole(PRODUCER_ROLE, dev.address)).to.equal(true);
    });

    it('John is asigned with PRODUCER_ROLE', async function () {
      await afp.addProducer(John.address);
      expect(await afp.hasRole(PRODUCER_ROLE, John.address)).to.equal(true);
    });

    it('Bob is asigned with WAREHOUSE_ROLE', async function () {
      await afp.addWarehouse(Bob.address);
      expect(await afp.hasRole(WAREHOUSE_ROLE, Bob.address)).to.equal(true);
    });

    it('Alice is asigned with VENDOR_ROLE', async function () {
      await afp.addVendor(Alice.address);
      expect(await afp.hasRole(VENDOR_ROLE, Alice.address)).to.equal(true);
    });
  });

  describe('Restricted Roles', async function () {
    it('Bob has *not* ADMIN_ROLE. He is not able to add new Vendor', async function () {
      await expect(afp.connect(Bob).addVendor(Alice.address)).to.be.reverted;
    });

    it('Bob has *not* PRODUCER_ROLE. He is not able to Produce an asset', async function () {
      const InputAsset = {
        name: 'tomatoes',
        quantity: 100,
      };

      await expect(afp.connect(Bob).Produce(InputAsset.name, InputAsset.quantity)).to.be.reverted;
    });

    it('Bob can *not* transfer a Food Asset he does not own', async function () {
      await expect(afp.connect(Bob).transferFrom(producer.address, Alice.address, 1)).to.be.reverted;
    });
    // add same test for Bob + warehouse / store
    // Non producer can't produce
    // Bob can't transfer await afp.connect(Bob).transferFrom(producer.address, Alice.address, 1);
  });

  describe('Transfer FoodAsset', async function () {
    it('Producer has a registered food assset ', async function () {
      // await afp.addVendor(Alice.address);

      const asset = await afp.getFoodAssetById(1);
      const foodType = asset.foodType; // tomatoes
      const foodSubtype = asset.foodSubtype; // tomatoes
      const producedBy = asset.producedBy; // tomatoes

      const quantity = asset.quantity; // ??
      // const quantityBn = ethers.BigNumber.from(assetQuantity); // 100 in BigNum ??
      // const quanityStr = assetQuantityBN.toString(); // '100'
      const quantityNum = quantity.toNumber(); // '100'

      expect(await quantityNum).to.equal(FOOD_ASSET_1.quantity);
      expect(await foodType).to.equal(FOOD_ASSET_1.foodType);
      expect(await foodSubtype).to.equal(FOOD_ASSET_1.foodSubtype);
      expect(await producedBy).to.equal(producer.address);

      // expect(await foodType).to.equal(`${InputAsset.quantity}`);
    });

    describe('Transfer AFP', async function () {
      it('Transfer 1 AFP from producer to Alice, with transferFrom', async function () {
        let ProducerBalanceInit = await afp.balanceOf(producer.address);
        let AliceBalanceInit = await afp.balanceOf(Alice.address);
        ProducerBalanceInitNum = ProducerBalanceInit.toNumber();
        AliceBalanceInitNum = AliceBalanceInit.toNumber();

        // transfer AFP from producer to Alice
        await afp.connect(producer).transferFrom(producer.address, Alice.address, 1);

        ProducerBalance = await afp.balanceOf(producer.address);
        AliceBalance = await afp.balanceOf(Alice.address);

        expect(await ProducerBalance.toNumber()).to.equal(ProducerBalanceInitNum - 1);
        expect(await AliceBalance.toNumber()).to.equal(AliceBalanceInitNum + 1);
      });

      it('Transfer 1 AFP from producer to Alice, with transferFromProducer', async function () {
        let ProducerBalanceInit = await afp.balanceOf(producer.address);
        let AliceBalanceInit = await afp.balanceOf(Alice.address);
        ProducerBalanceInitNum = ProducerBalanceInit.toNumber();
        AliceBalanceInitNum = AliceBalanceInit.toNumber();

        // transfer AFP from producer to Alice
        await afp.connect(producer).transferFromProducer(producer.address, Alice.address, 1);

        ProducerBalance = await afp.balanceOf(producer.address);
        AliceBalance = await afp.balanceOf(Alice.address);

        expect(await ProducerBalance.toNumber()).to.equal(ProducerBalanceInitNum - 1);
        expect(await AliceBalance.toNumber()).to.equal(AliceBalanceInitNum + 1);
      });
    });

    // const cc = await afp.getFoodAssetById(1);
    // console.log(cc);
  });

  describe('Producer owns two NFTs', async function () {
    it('List NFTs by produced by producer', async function () {
      const ownedIDs = await ownedNftIDs(afp, producer.address);
      // console.log(ownedIDs);
      const NFTList = await ownedNFTs(afp, ownedIDs);

      expect(await NFTList.length).to.equal(2);

      /*
      NFTList example bellow

      [
        [
          'tomatoes',
          BigNumber { _hex: '0x64', _isBigNumber: true },
          name: 'tomatoes',
          quantity: BigNumber { _hex: '0x64', _isBigNumber: true }
        ],
        [
          'potatoes',
          BigNumber { _hex: '0xc8', _isBigNumber: true },
          name: 'potatoes',
          quantity: BigNumber { _hex: '0xc8', _isBigNumber: true }
        ]
      ]
      */
    });
  });

  describe('Filter Events', async function () {
    it('Filter transfer events', async function () {
      await afp.connect(producer).transferFromProducer(producer.address, Alice.address, 1);
      await afp.connect(producer).transferFromProducer(producer.address, Alice.address, 2);

      console.log('producer', producer.address);
      console.log('Alice', Alice.address);

      const eventFilter = afp.filters.Transfer();
      const events = await afp.queryFilter(eventFilter);

      // console.log(events);

      const final = [];

      for (const event of events) {
        const from = event.args[0];
        const to = event.args[1];
        const tokenId = event.args[2];
        const blockNumber = event.blockNumber;
        const blockHash = event.blockHash;
        const transactionHash = event.transactionHash;
        const transactionLink = `https://rinkeby.etherscan.io/tx/${transactionHash}`;

        // console.log('\n---\nEVENT');
        // console.log('tokenId', tokenId.toNumber());

        // console.log('From', accountNames[from], from);
        // console.log('To', accountNames[to], to);
        // console.log('blockNumber', blockNumber, to);
        // console.log('blockHash', blockHash, to);
        // console.log('transactionHash', transactionHash, to);
        // console.log('transactionLink', transactionLink, to);
      }

      // const bb = events.topics[2];
      // console.log(bb.toString());
    });
  });

  // describe('Add roles', async function () {
  // it('put a title here', async function () {
  // });
  // });

  // it('put a title here', async function () {
  // });
});
