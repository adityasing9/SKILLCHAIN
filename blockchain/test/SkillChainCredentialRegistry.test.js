const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SkillChainCredentialRegistry", function () {
  let registry;
  let admin, issuer1, unauthorizedUser;

  beforeEach(async function () {
    [admin, issuer1, unauthorizedUser] = await ethers.getSigners();
    const Registry = await ethers.getContractFactory("SkillChainCredentialRegistry");
    registry = await Registry.deploy();
    await registry.waitForDeployment();
  });

  it("Should set deployer as admin and authorized issuer", async function () {
    expect(await registry.admin()).to.equal(admin.address);
    expect(await registry.authorizedIssuers(admin.address)).to.be.true;
  });

  it("Should allow admin to authorize new educational institutions", async function () {
    await registry.authorizeIssuer(issuer1.address, "Stanford University");
    expect(await registry.authorizedIssuers(issuer1.address)).to.be.true;
    expect(await registry.issuerNames(issuer1.address)).to.equal("Stanford University");
  });

  it("Should allow authorized issuer to register credentials", async function () {
    await registry.authorizeIssuer(issuer1.address, "MIT Tech");

    const credId = "SKILL-2026-001";
    const certHash = "a3f5c9e294918e6a12b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5";

    await expect(
      registry.connect(issuer1).registerCredential(credId, certHash, "MIT Tech")
    )
      .to.emit(registry, "CredentialRegistered")
      .withArgs(credId, certHash, issuer1.address, "MIT Tech", (await ethers.provider.getBlock("latest")).timestamp + 1);

    const [exists, storedHash, issuer, instName, timestamp, isRevoked] =
      await registry.verifyCredential(credId);

    expect(exists).to.be.true;
    expect(storedHash).to.equal(certHash);
    expect(issuer).to.equal(issuer1.address);
    expect(instName).to.equal("MIT Tech");
    expect(isRevoked).to.be.false;
  });

  it("Should prevent unauthorized users from registering credentials", async function () {
    const credId = "SKILL-FAKE-001";
    const certHash = "0000000000000000000000000000000000000000000000000000000000000000";

    await expect(
      registry.connect(unauthorizedUser).registerCredential(credId, certHash, "Fake University")
    ).to.be.revertedWith("SkillChain: Not an authorized issuing institution");
  });

  it("Should prevent duplicate credential registrations", async function () {
    const credId = "SKILL-DUP-001";
    const certHash = "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";

    await registry.registerCredential(credId, certHash, "Admin Academy");

    await expect(
      registry.registerCredential(credId, certHash, "Admin Academy")
    ).to.be.revertedWith("SkillChain: Credential ID already registered");
  });

  it("Should allow only the issuer or admin to revoke a credential", async function () {
    await registry.authorizeIssuer(issuer1.address, "UC Berkeley");
    const credId = "SKILL-REVOKE-001";
    const certHash = "1111222233334444555566667777888899990000aaaabbbbccccddddeeeeffff";

    await registry.connect(issuer1).registerCredential(credId, certHash, "UC Berkeley");

    // Unauthorized user attempts revocation
    await expect(
      registry.connect(unauthorizedUser).revokeCredential(credId, "Fraud detected")
    ).to.be.revertedWith("SkillChain: Unauthorized to revoke this credential");

    // Proper issuer revokes
    await expect(
      registry.connect(issuer1).revokeCredential(credId, "Course incomplete / cheating")
    )
      .to.emit(registry, "CredentialRevoked");

    const record = await registry.verifyCredential(credId);
    expect(record.isRevoked).to.be.true;
    expect(record.revocationReason).to.equal("Course incomplete / cheating");
  });

  it("Should verify hash integrity correctly", async function () {
    const credId = "SKILL-VERIFY-001";
    const correctHash = "correcthash99999999999999999999999999999999999999999999999999999999";
    const tamperedHash = "tamperedhash111111111111111111111111111111111111111111111111111111";

    await registry.registerCredential(credId, correctHash, "Root Inst");

    const [matchesCorrect, isRevokedCorrect, existsCorrect] = await registry.verifyHashIntegrity(credId, correctHash);
    expect(matchesCorrect).to.be.true;
    expect(isRevokedCorrect).to.be.false;
    expect(existsCorrect).to.be.true;

    const [matchesTampered, , ] = await registry.verifyHashIntegrity(credId, tamperedHash);
    expect(matchesTampered).to.be.false;
  });
});
