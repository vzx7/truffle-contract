const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
  } = require('@openzeppelin/test-helpers');
  
  var chai = require("chai");
  const chaiBN = require('chai-bn')(BN);
  chai.use(chaiBN);
  
  var chaiAsPromised = require("chai-as-promised");
  chai.use(chaiAsPromised);
  
  const expect = chai.expect;

  
  const ZVToken = artifacts.require('ZVToken');
  
  contract('ZVToken', function ([sender, receiver]) {


    beforeEach(async function () {
      // The bundled BN library is the same one web3 uses under the hood
      this.value = new BN(100);
      this.erc20 = await ZVToken.new();
    });
 
    it('reverts when transferring tokens to the zero address', async function () {
      // Conditions that trigger a require statement can be precisely tested
      await expectRevert(
        this.erc20.transfer(constants.ZERO_ADDRESS, this.value, { from: sender }),
        'ERC20: transfer to the zero address',
      );
    });
  
    it('emits a Transfer event on successful transfers', async function () {
      const receipt = await this.erc20.transfer(
        receiver, this.value, { from: sender }
      );
  
      // Event assertions can verify that the arguments are the expected ones
      expectEvent(receipt, 'Transfer', {
        from: sender,
        to: receiver,
        value: this.value,
      });
    });
  
    it('updates balances on successful transfers', async function () {
      this.erc20.transfer(receiver, this.value, { from: sender });
      // BN assertions are automatically available via chai-bn (if using Chai)
      expect(await this.erc20.balanceOf(receiver))
        .to.be.bignumber.equal(new BN(0));
    });
  });