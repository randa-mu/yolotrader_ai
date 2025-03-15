import * as React from "react"
import {Dispatch} from "react"
import {AppAction, AppState} from "@/state/app-reducer"
import {AgentRisk} from "@/components/AgentRisk"
import {AgentLiquidity} from "@/components/AgentLiquidity"
import { NewsData } from "@/data/news"
import {ChainState} from "@/state/chain-reducer"

type AgentViewProps = {
    state: AppState
    chainState: ChainState
    priceData: Array<number>
    marketSentimentData: Array<NewsData>
    dispatch: Dispatch<AppAction>
}

export const AgentView = (props: AgentViewProps) => {
    return (
        <div className="basis-2/5 flex flex-col border border-neutral-800">
            <div className="w-full p-1 px-2 gap-2 bg-neutral-800 font-mono text-sm text-left text-neutral-400">
                <span className="">Agent advisory</span>
            </div>
            <AgentLiquidity
                appState={props.state}
                priceData={props.priceData}
                marketSentimentData={props.marketSentimentData}
                dispatch={props.dispatch}
            />
            <AgentRisk
                appState={props.state}
                chainState={props.chainState}
                priceData={props.priceData}
                marketSentimentData={props.marketSentimentData}
                dispatch={props.dispatch}
            />
        </div>
    )
}