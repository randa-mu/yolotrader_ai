import {AbiCoder, ContractTransactionResponse, getBytes, keccak256} from "ethers"
import {G1} from "mcl-wasm"
import {BlsBn254} from "@/lib/bls"
import {APP_CONFIG, SIGNING_CONFIG, WALLET} from "@/config"
import {ThresholdWallet__factory} from "@/generated"


export const TREASURY_ADDRESS = APP_CONFIG.treasuryAddress
export const ORDERBOOK_ADDRESS = APP_CONFIG.orderbookAddress


export async function sendTransfer(from: string, to: string, nonce: bigint) {
    const bls = await BlsBn254.create()
    const { secretKey } = bls.createKeyPair("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d")
    const m = encodeMessage(to, SIGNING_CONFIG.amount, nonce)
    const h_m = bls.hashToPoint(SIGNING_CONFIG.DST, m)
    const { signature } = bls.sign(h_m, secretKey)
    const sigBytes = bls.serialiseG1Hex(signature)
    const pk = bls.g2FromEvmHex("0x01015bba27cd2725e80b996e3c6f1dccaa532b63e0bcd48cce529e8c431215c92009b5d7e6659ad11b2134dc5978536f60f0f9c61b4e7cd70f6d069823e9701d0f34ffc0589e6b12d4a7e5c825f3667ea3cf7361c7f2cee5bbc3c18b596726781fbcbb669449e378ed7361d67b949679da223d0c4f29a0da9119b64ffb16abb9")
    console.log("verifies", bls.verify(bls.hashToPoint(SIGNING_CONFIG.DST, m), pk, signature))

    const contract = ThresholdWallet__factory.connect(from, WALLET)
    const tx: ContractTransactionResponse = await contract.transfer(to, SIGNING_CONFIG.amount, sigBytes)
    await tx.wait()
}

function encodeKey(k: string): `0x${string}` {
    if (k.startsWith("0x")) {
        return k as `0x${string}`
    }
    return `0x${k}`
}

function encodeMessage(address: string, amount: bigint, nonce: bigint): Uint8Array {
    return getBytes(AbiCoder.defaultAbiCoder().encode(["address", "uint256", "uint256"], [address, amount, nonce]))
}

export async function aggregateSignatures(signatures: Array<G1>): Promise<G1> {
    if (signatures.length < SIGNING_CONFIG.threshold) {
        throw new Error("not enough signatures to aggregate")
    }
    const bls = await BlsBn254.create()

    let aggregated: G1 = signatures[0]
    for (let i = 1; i < SIGNING_CONFIG.threshold; i++) {
        aggregated = bls.aggregate(aggregated, signatures[i])
    }

    return aggregated
}
