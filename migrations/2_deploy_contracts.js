const ZVToken = artifacts.require('ZVToken');

module.exports = function (deployer) {
    deployer.deploy(ZVToken);
}