// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SkillChainCredentialRegistry
 * @dev Cryptographic trust registry for tamper-proof credential verification.
 * Only stores minimal cryptographic proof off-chain hashes, timestamps, issuer, and revocation status.
 */
contract SkillChainCredentialRegistry {
    address public admin;

    struct CredentialRecord {
        string credentialId;
        string certificateHash; // SHA-256 hex string or bytes32
        address issuer;
        string institutionName;
        uint256 issueTimestamp;
        bool exists;
        bool isRevoked;
        uint256 revokedTimestamp;
        string revocationReason;
    }

    // Mapping from authorized issuer address to active status
    mapping(address => bool) public authorizedIssuers;
    mapping(address => string) public issuerNames;

    // Mapping from unique credential ID to CredentialRecord
    mapping(string => CredentialRecord) private credentials;

    // Events for transparent audit trail on-chain
    event IssuerAuthorized(address indexed issuer, string institutionName);
    event IssuerDeauthorized(address indexed issuer);
    event CredentialRegistered(
        string indexed credentialId,
        string certificateHash,
        address indexed issuer,
        string institutionName,
        uint256 timestamp
    );
    event CredentialRevoked(
        string indexed credentialId,
        address indexed revokedBy,
        uint256 timestamp,
        string reason
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "SkillChain: Only platform admin can perform this operation");
        _;
    }

    modifier onlyAuthorizedIssuer() {
        require(
            authorizedIssuers[msg.sender] || msg.sender == admin,
            "SkillChain: Not an authorized issuing institution"
        );
        _;
    }

    constructor() {
        admin = msg.sender;
        authorizedIssuers[msg.sender] = true;
        issuerNames[msg.sender] = "SkillChain Platform Authority";
    }

    /**
     * @notice Authorize an educational institution to issue credentials
     */
    function authorizeIssuer(address issuer, string calldata institutionName) external onlyAdmin {
        require(issuer != address(0), "SkillChain: Invalid address");
        authorizedIssuers[issuer] = true;
        issuerNames[issuer] = institutionName;
        emit IssuerAuthorized(issuer, institutionName);
    }

    /**
     * @notice Deauthorize an educational institution
     */
    function deauthorizeIssuer(address issuer) external onlyAdmin {
        authorizedIssuers[issuer] = false;
        emit IssuerDeauthorized(issuer);
    }

    /**
     * @notice Register a newly issued credential proof on-chain
     */
    function registerCredential(
        string calldata credentialId,
        string calldata certificateHash,
        string calldata institutionName
    ) external onlyAuthorizedIssuer {
        require(bytes(credentialId).length > 0, "SkillChain: Credential ID cannot be empty");
        require(bytes(certificateHash).length > 0, "SkillChain: Hash cannot be empty");
        require(!credentials[credentialId].exists, "SkillChain: Credential ID already registered");

        string memory instName;
        if (bytes(institutionName).length > 0) {
            instName = institutionName;
        } else {
            instName = issuerNames[msg.sender];
        }

        credentials[credentialId] = CredentialRecord({
            credentialId: credentialId,
            certificateHash: certificateHash,
            issuer: msg.sender,
            institutionName: instName,
            issueTimestamp: block.timestamp,
            exists: true,
            isRevoked: false,
            revokedTimestamp: 0,
            revocationReason: ""
        });

        emit CredentialRegistered(
            credentialId,
            certificateHash,
            msg.sender,
            instName,
            block.timestamp
        );
    }

    /**
     * @notice Revoke an existing credential.
     * Can only be performed by the credential's original issuer or the admin.
     */
    function revokeCredential(string calldata credentialId, string calldata reason) external {
        require(credentials[credentialId].exists, "SkillChain: Credential not found");
        require(!credentials[credentialId].isRevoked, "SkillChain: Credential already revoked");
        require(
            msg.sender == credentials[credentialId].issuer || msg.sender == admin,
            "SkillChain: Unauthorized to revoke this credential"
        );

        credentials[credentialId].isRevoked = true;
        credentials[credentialId].revokedTimestamp = block.timestamp;
        credentials[credentialId].revocationReason = reason;

        emit CredentialRevoked(credentialId, msg.sender, block.timestamp, reason);
    }

    /**
     * @notice Query verification data for any credential
     */
    function verifyCredential(string calldata credentialId)
        external
        view
        returns (
            bool exists,
            string memory certificateHash,
            address issuer,
            string memory institutionName,
            uint256 issueTimestamp,
            bool isRevoked,
            uint256 revokedTimestamp,
            string memory revocationReason
        )
    {
        CredentialRecord memory record = credentials[credentialId];
        return (
            record.exists,
            record.certificateHash,
            record.issuer,
            record.institutionName,
            record.issueTimestamp,
            record.isRevoked,
            record.revokedTimestamp,
            record.revocationReason
        );
    }

    /**
     * @notice Helper to check if a specific certificate hash matches the on-chain registered hash
     */
    function verifyHashIntegrity(string calldata credentialId, string calldata computedHash)
        external
        view
        returns (bool matches, bool isRevoked, bool exists)
    {
        CredentialRecord memory record = credentials[credentialId];
        if (!record.exists) {
            return (false, false, false);
        }
        bool hashMatch = keccak256(abi.encodePacked(record.certificateHash)) == keccak256(abi.encodePacked(computedHash));
        return (hashMatch, record.isRevoked, true);
    }
}
