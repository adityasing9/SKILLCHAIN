const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying SkillChainCredentialRegistry with account:", deployer.address);

  const Registry = await hre.ethers.getContractFactory("SkillChainCredentialRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();

  const registryAddress = await registry.getAddress();
  console.log("SkillChainCredentialRegistry deployed to:", registryAddress);

  // Authorize test issuer
  const tx = await registry.authorizeIssuer(deployer.address, "Apex Institute of Technology");
  await tx.wait();
  console.log("Authorized deployer as 'Apex Institute of Technology'");

  // Save deployed address and ABI to backend and frontend config
  const deploymentInfo = {
    contractAddress: registryAddress,
    deployerAddress: deployer.address,
    network: hre.network.name,
    chainId: hre.network.config.chainId || 31337,
    deployedAt: new Date().toISOString(),
  };

  const artifactsDir = path.join(__dirname, "../artifacts/contracts/SkillChainCredentialRegistry.sol/SkillChainCredentialRegistry.json");
  if (fs.existsSync(artifactsDir)) {
    const artifact = JSON.parse(fs.readFileSync(artifactsDir, "utf8"));
    deploymentInfo.abi = artifact.abi;
  }

  const outPath = path.join(__dirname, "../deployment-info.json");
  fs.writeFileSync(outPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("Saved deployment info to:", outPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
