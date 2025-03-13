import {getBytes, JsonRpcProvider, parseEther, Wallet} from "ethers"

export const APP_CONFIG = {
    msPerEpoch: 10_000,
    orderSize: 1000,
    token: "MOON",
    inferenceRetries: 10,
    minimumPriceChartEpochs: 5,
    rpcUrl: "http://localhost:8545",
    treasuryAddress: "0x700b6A60ce7EaaEA56F065753d8dcB9653dbAD35",
    orderbookAddress: "0xA15BB66138824a1c7167f5E85b957d04Dd34E468",

    openApiApiKey: import.meta.env.VITE_OPENAI_API_KEY,
    openApiAssistantId: import.meta.env.VITE_OPENAI_ASSISTANT_ID,
    riskAgentPrivateKey: import.meta.env.VITE_RISK_AGENT_PRIVATE_KEY,
    liquidityPrivateKey: import.meta.env.VITE_LIQUIDITY_PRIVATE_KEY,
    humanPrivateKey: import.meta.env.VITE_HUMAN_PRIVATE_KEY,
}

export const SIGNING_CONFIG = {
    amount: 1000n,
    threshold: 2,
    // "BLOCKLOCK_BN254G1_XMD:KECCAK-256_SVDW_RO_H1_"
    DST: getBytes("0x424c4f434b4c4f434b5f424e32353447315f584d443a4b454343414b2d3235365f535644575f524f5f48315f")
}

export const WALLET = new Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", new JsonRpcProvider(APP_CONFIG.rpcUrl))