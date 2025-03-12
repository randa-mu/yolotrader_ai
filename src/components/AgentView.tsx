import * as React from "react"
import {AgentDecisionAction, AppState} from "@/reducer/app-reducer"
import {AgentStatus} from "@/components/AgentStatus"

type AgentViewProps = {
    state: AppState
    priceData: Array<number>
    marketSentimentData: Array<string>
    onAgentDecision: (agent: AgentDecisionAction) => unknown
}
export const AgentView = (props: AgentViewProps) => {
    return (
        <div className="flex flex-col space-2 justify-center p-2">
            <h1 className="text-4xl font-extrabold">Agent actions</h1>
            <AgentStatus
                agent={"liquidity"}
                appState={props.state}
                priceData={props.priceData}
                marketSentimentData={props.marketSentimentData}
                onAgentDecision={props.onAgentDecision}
            />
            <AgentStatus
                agent={"risk"}
                appState={props.state}
                priceData={props.priceData}
                marketSentimentData={props.marketSentimentData}
                onAgentDecision={props.onAgentDecision}
            />

        </div>
    )
}