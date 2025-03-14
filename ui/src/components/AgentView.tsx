import * as React from "react"
import {AgentDecisionAction, AppAction, AppState} from "@/state/app-reducer"
import {AgentRisk} from "@/components/AgentRisk"
import {AgentLiquidity} from "@/components/AgentLiquidity"
import {ChainState} from "@/state/chain-reducer"
import {Dispatch} from "react"

type AgentViewProps = {
    state: AppState
    chainState: ChainState
    priceData: Array<number>
    marketSentimentData: Array<string>
    dispatch: Dispatch<AppAction>
}

export const AgentView = (props: AgentViewProps) => {
    return (
        <div className="flex flex-col space-2 justify-center p-2">
            <h1 className="text-4xl font-extrabold">Agent actions</h1>
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