import {JsonRpcProvider, Wallet} from "ethers"

export const APP_CONFIG = {
    msPerEpoch: 10_000,
    orderSize: 1000,
    token: "MOON",
    inferenceRetries: 10,
    minimumPriceChartEpochs: 5,
    rpcUrl: import.meta.env.VITE_RPC_URL,
    openApiApiKey: import.meta.env.VITE_OPENAI_API_KEY,
    openApiAssistantId: import.meta.env.VITE_OPENAI_ASSISTANT_ID
}

export const WALLET = new Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", new JsonRpcProvider(APP_CONFIG.rpcUrl))