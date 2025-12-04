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
        <div className="w-full px-4 md:px-6 lg:px-8 py-1">
            <div className="grid grid-cols-2 grid-rows-2 gap-4 font-mono text-left">
                <div className="flex flex-col text-white">
                    <span className="text-xs md:text-sm text-muted">TREASURY BALANCE</span>
                    <span className="text-xl md:text-2xl font-semibold text-blue-500">
                        {APP_CONFIG.token} {treasury.toLocaleString()}
                    </span>
                </div>

                <div className="flex flex-col text-white text-right">
                    <span className="text-xs md:text-sm text-muted">ORDER BOOK</span>
                    <span className="text-xl md:text-2xl font-semibold text-blue-500">
                        {APP_CONFIG.token} {orderBook}
                    </span>
                </div>

                <div className="flex flex-col justify-end text-white">
                    <span className="text-xs md:text-sm text-muted">EPOCH</span>
                    <span className="text-xl md:text-2xl font-semibold">
                        <EpochCounter epoch={props.epoch} msPerEpoch={props.EPOCH_DURATION_MS}/>
                    </span>
                </div>

                <div className="flex flex-col justify-end text-white text-right">
                    {/* Reserved for future metric or status to complete 2x2 grid */}
                </div>
            </div>
        </div>
    )
}
