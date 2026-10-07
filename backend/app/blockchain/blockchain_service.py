import os
import json
from web3 import Web3
from eth_account import Account
from app.config.settings import settings

class BlockchainService:
    def __init__(self):
        self.rpc_url = settings.BLOCKCHAIN_RPC_URL
        self.chain_id = settings.CHAIN_ID
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        self.contract_address = settings.CONTRACT_ADDRESS
        self.private_key = settings.ISSUER_PRIVATE_KEY
        self.contract = None
        self._load_contract()

    def _load_contract(self):
        # Locate hardhat artifact or deployment-info
        root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../blockchain"))
        deploy_info_file = os.path.join(root_dir, "deployment-info.json")
        artifact_file = os.path.join(root_dir, "artifacts/contracts/SkillChainCredentialRegistry.sol/SkillChainCredentialRegistry.json")
        
        abi = None
        if os.path.exists(deploy_info_file):
            try:
                with open(deploy_info_file, "r") as f:
                    data = json.load(f)
                    if not self.contract_address and data.get("contractAddress"):
                        self.contract_address = data["contractAddress"]
                    abi = data.get("abi")
            except Exception as e:
                print("Error loading deployment-info.json:", e)

        if not abi and os.path.exists(artifact_file):
            try:
                with open(artifact_file, "r") as f:
                    data = json.load(f)
                    abi = data.get("abi")
            except Exception as e:
                print("Error loading artifact:", e)

        if abi and self.contract_address and self.w3.is_connected():
            try:
                checksummed_address = Web3.to_checksum_address(self.contract_address)
                self.contract = self.w3.eth.contract(address=checksummed_address, abi=abi)
            except Exception as e:
                print(f"Failed to instantiate contract: {e}")

    def is_connected(self) -> bool:
        return self.w3.is_connected()

    def register_credential_on_chain(self, credential_id: str, cert_hash: str, institution_name: str) -> dict:
        """
        Sends an EVM transaction calling registerCredential(credentialId, certificateHash, institutionName)
        """
        if not self.is_connected():
            return {
                "success": False,
                "tx_hash": f"0x_mock_simulated_{cert_hash[:16]}",
                "error": "Blockchain node not connected (Simulated mode active)"
            }

        if not self.contract:
            return {
                "success": False,
                "tx_hash": f"0x_simulated_{cert_hash[:20]}",
                "error": "Contract not initialized or address missing"
            }

        try:
            account = Account.from_key(self.private_key)
            sender_address = account.address
            nonce = self.w3.eth.get_transaction_count(sender_address)
            
            tx = self.contract.functions.registerCredential(
                credential_id,
                cert_hash,
                institution_name
            ).build_transaction({
                'from': sender_address,
                'nonce': nonce,
                'gas': 300000,
                'gasPrice': self.w3.eth.gas_price,
                'chainId': self.chain_id
            })

            signed_tx = self.w3.eth.account.sign_transaction(tx, private_key=self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.raw_transaction)
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=30)

            return {
                "success": receipt.status == 1,
                "tx_hash": tx_hash.hex(),
                "block_number": receipt.blockNumber,
                "gas_used": receipt.gasUsed
            }
        except Exception as e:
            print(f"Blockchain registerCredential error: {e}")
            return {
                "success": False,
                "tx_hash": None,
                "error": str(e)
            }

    def revoke_credential_on_chain(self, credential_id: str, reason: str) -> dict:
        """
        Sends an EVM transaction calling revokeCredential(credentialId, reason)
        """
        if not self.is_connected() or not self.contract:
            return {
                "success": False,
                "tx_hash": "0x_mock_revocation",
                "error": "Blockchain not connected"
            }

        try:
            account = Account.from_key(self.private_key)
            sender_address = account.address
            nonce = self.w3.eth.get_transaction_count(sender_address)

            tx = self.contract.functions.revokeCredential(
                credential_id,
                reason
            ).build_transaction({
                'from': sender_address,
                'nonce': nonce,
                'gas': 200000,
                'gasPrice': self.w3.eth.gas_price,
                'chainId': self.chain_id
            })

            signed_tx = self.w3.eth.account.sign_transaction(tx, private_key=self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.raw_transaction)
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=30)

            return {
                "success": receipt.status == 1,
                "tx_hash": tx_hash.hex(),
                "block_number": receipt.blockNumber
            }
        except Exception as e:
            print(f"Blockchain revokeCredential error: {e}")
            return {
                "success": False,
                "tx_hash": None,
                "error": str(e)
            }

    def verify_credential_on_chain(self, credential_id: str) -> dict:
        """
        Read-only query to get on-chain proof
        """
        if not self.is_connected() or not self.contract:
            return {
                "connected": False,
                "exists": False,
                "message": "Blockchain offline or contract not configured"
            }

        try:
            res = self.contract.functions.verifyCredential(credential_id).call()
            # Returns (exists, certHash, issuer, instName, timestamp, isRevoked, revokedTimestamp, reason)
            return {
                "connected": True,
                "exists": res[0],
                "certificateHash": res[1],
                "issuerAddress": res[2],
                "institutionName": res[3],
                "issueTimestamp": res[4],
                "isRevoked": res[5],
                "revokedTimestamp": res[6],
                "revocationReason": res[7]
            }
        except Exception as e:
            print(f"Blockchain verifyCredential error: {e}")
            return {
                "connected": True,
                "exists": False,
                "error": str(e)
            }

blockchain_service = BlockchainService()
