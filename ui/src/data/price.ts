export type TokenData = {
    token: string
    price: Array<PriceData>
    volume: Array<VolumeData>
}
export type PriceData = {
    epoch: number
    price: number
}
export type VolumeData = {
    epoch: number
    volume: number
}
export const PRICE_DATA = {
    "price_data": [
        {"epoch": 1, "price": 1.00},
        {"epoch": 2, "price": 1.15},
        {"epoch": 3, "price": 1.25},
        {"epoch": 4, "price": 0.65},
        {"epoch": 5, "price": 0.45},
        {"epoch": 6, "price": 0.50},
        {"epoch": 7, "price": 0.75},
        {"epoch": 8, "price": 1.10},
        {"epoch": 9, "price": 1.45},
        {"epoch": 10, "price": 1.90}
    ],
    "volume_data": [
        {"epoch": 1, "volume": 1000},
        {"epoch": 2, "volume": 1500},
        {"epoch": 3, "volume": 2500},
        {"epoch": 4, "volume": 4000},
        {"epoch": 5, "volume": 3500},
        {"epoch": 6, "volume": 5000},
        {"epoch": 7, "volume": 6500},
        {"epoch": 8, "volume": 8000},
        {"epoch": 9, "volume": 12000},
        {"epoch": 10, "volume": 15000}
    ]
}
