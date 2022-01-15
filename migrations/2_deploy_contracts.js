const Khufu = artifacts.require("Khufu");
const GizaToken = artifacts.require("GizaToken");

module.exports = async function (deployer) {
  // deploy GIZA token
  await deployer.deploy(GizaToken);
  const token = await GizaToken.deployed();

  // deploy Khufu
  await deployer.deploy(Khufu, token.address);
  const khufu = await Khufu.deployed();
  
  // change GIZA token ownership
  await token.passMinterRole(khufu.address);
};