import * as React from "react"
import {APP_CONFIG} from "@/config"
import {EpochCounter} from "./EpochCounter"
import {NewsData} from "@/data/news"
import {ChainState} from "@/state/chain-reducer"
import {AppState} from "@/state/app-reducer"

type TradingViewProps = {
    state: AppState
    chainState: ChainState
    priceData: Array<number>
    sentimentData: Array<NewsData>
    epoch: bigint
    EPOCH_DURATION_MS: number
}
export const TradingHeader = (props: TradingViewProps) => {
    const orderBook = props.chainState.orderbook.balance ?? 0n
    const treasury = props.chainState.treasury.balance ?? 0n
    console.log(orderBook)

    return (
        <div className="w-full">
            <div className="grid grid-cols-5 gap-2 p-1 font-mono text-2xl font-semibold text-left px-2">
                <div className="text-white col-span-2 flex"><p>TREASURY BALANCE</p><span
                    className="text-blue-500 ml-4">{APP_CONFIG.token} {treasury.toLocaleString()}</span></div>

                <div className="text-white col-span-2 flex"><p>ORDER BOOK</p>
                    <div className="text-blue-500 ml-4">{APP_CONFIG.token} {orderBook}</div>
                </div>
                <div className="col-span-1 text-right">
                    <EpochCounter epoch={props.epoch} msPerEpoch={props.EPOCH_DURATION_MS}/>
                </div>
            </div>
        </div>
    )
}
