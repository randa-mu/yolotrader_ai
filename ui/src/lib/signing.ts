import {AbiCoder, ContractTransactionResponse, JsonRpcProvider, parseEther, Wallet} from "ethers"
import {G1} from "mcl-wasm"
import {BlsBn254} from "@/lib/bls"
import {Agent} from "@/state/app-reducer"
import {APP_CONFIG} from "@/config"
import {ThresholdWallet__factory} from "@/generated"

const SIGNING_CONFIG = {
    amount: parseEther("1"),
    threshold: 2,
    DST: new TextEncoder().encode("BLOCKLOCK_BN254G1_XMD:KECCAK-256_SVDW_RO_H1_")
}

export const TREASURY_ADDRESS = import.meta.env.VITE_TREASURY_ADDRESS
export const ORDERBOOK_ADDRESS = import.meta.env.VITE_ORDERBOOK_ADDRESS
const VITE_RISK_AGENT_PRIVATE_KEY = import.meta.env.VITE_RISK_AGENT_PRIVATE_KEY
const VITE_LIQUIDITY_PRIVATE_KEY = import.meta.env.VITE_LIQUIDITY_PRIVATE_KEY
const VITE_HUMAN_PRIVATE_KEY = import.meta.env.VITE_HUMAN_PRIVATE_KEY

export async function testSigning(nonce: bigint) {
    const bls = await BlsBn254.create()

    const s1 = await signTransfer("risk", ORDERBOOK_ADDRESS, nonce)
    const s2 = await signTransfer("liquidity", ORDERBOOK_ADDRESS, nonce)
    const groupSig = await aggregateSignatures([s1, s2])
    const groupSigBytes = bls.serialiseG1Hex(groupSig)

    const wallet = new Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", new JsonRpcProvider(APP_CONFIG.rpcUrl))
    const contract = ThresholdWallet__factory.connect(TREASURY_ADDRESS, wallet)
    const tx: ContractTransactionResponse = await contract.transfer(ORDERBOOK_ADDRESS, SIGNING_CONFIG.amount, groupSigBytes)
    await tx.wait()
}

export async function signTransfer(agent: Agent, recipient: string, nonce: bigint): Promise<G1> {
    const bls = await BlsBn254.create()

    let key: string
    switch (agent) {
        case "human":
            key = VITE_HUMAN_PRIVATE_KEY;
            break
        case "liquidity":
            key = VITE_LIQUIDITY_PRIVATE_KEY;
            break
        case "risk":
            key = VITE_RISK_AGENT_PRIVATE_KEY;
            break
    }

    const message = encodeMessage(recipient, SIGNING_CONFIG.amount, nonce)
    const {secretKey} = bls.createKeyPair(encodeKey(key))
    const {signature} = bls.sign(bls.hashToPoint(SIGNING_CONFIG.DST, message), secretKey)
    return signature
}

function encodeKey(k: string): `0x${string}` {
    if (k.startsWith("0x")) {
        return k as `0x${string}`
    }
    return `0x${k}`
}

function encodeMessage(address: string, amount: bigint, nonce: bigint): Uint8Array {
    return AbiCoder.defaultAbiCoder().encode(["address", "uint256", "uint256"], [address, amount, nonce])
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