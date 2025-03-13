
export const APP_CONFIG = {
    msPerEpoch: 10_000,
    orderSize: 1000,
    treasuryStartingBalance: 10_000_000,
    token: "MOON",
    inferenceRetries: 10,
    minimumPriceChartEpochs: 5,
    rpcUrl: import.meta.env.VITE_RPC_URL
}