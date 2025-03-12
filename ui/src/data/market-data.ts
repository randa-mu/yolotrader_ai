type WithEpoch = { epoch: number }
export type PriceDataPoint = { price: number } & WithEpoch
export type MarketSentimentDataPoint = { tweet: string } & WithEpoch