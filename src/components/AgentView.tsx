import * as React from "react"
import {AgentDecisionAction, AppState} from "@/reducer/app-reducer"
import {AgentStatus} from "@/components/AgentStatus"
import {MarketData} from "@/data/market-data"

type AgentViewProps = {
    state: AppState
    marketState: MarketData
    onAgentDecision: (agent: AgentDecisionAction) => unknown
}
export const AgentView = (props: AgentViewProps) => {
    return (
        <div className="flex flex-row space-2 justify-center p-2">
            <AgentStatus
                agent={"liquidity"}
                state={props.state}
                marketState={props.marketState}
                onAgentDecision={props.onAgentDecision}
            />
            <AgentStatus
                agent={"risk"}
                state={props.state}
                marketState={props.marketState}
                onAgentDecision={props.onAgentDecision}
            />

        </div>
    )
}