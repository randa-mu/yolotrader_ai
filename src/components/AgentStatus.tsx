import * as React from "react"
import {Agent, AgentDecisionAction, AppState, createAgentDecision, Decision} from "@/reducer/appReducer"
import {MarketData} from "@/reducer/data"
import {useEffect, useState} from "react"
import {IndicatorIcon} from "@/components/Indicators"

type AgentStatusProps = {
    agent: Agent
    state: AppState
    marketState: MarketData
    onAgentDecision: (agent: AgentDecisionAction) => unknown
}
export const AgentStatus = (props: AgentStatusProps) => {
    const {epoch} = props.state
    const [isLoading, setLoading] = useState(true)

    useEffect(() => {
        const randomLatency = Math.random() * 4000
        setLoading(true)
        setTimeout(
            () => {
                props.onAgentDecision(createAgentDecision(props.agent, randomDecision()))
                setLoading(false)
            },
            randomLatency
        )
    }, [epoch])

    const cleanName = props.agent.charAt(0).toUpperCase() + props.agent.slice(1).toLowerCase()
    return (
        <div className="flex flex-row space-x-2 p-2">
            <div>{cleanName} agent:</div>
            <div>
                {isLoading
                    ? <LoadingSpinner/>
                    : <IndicatorIcon value={props.state.current.get(props.agent)}/>
                }
            </div>
        </div>
    )
}

function randomDecision(): Decision {
    const rand = Math.round(Math.random() * 3)
    if (rand === 0) {
        return "BUY"
    }
    if (rand === 1) {
        return "SELL"
    }
    return "NO ACTION"
}

function LoadingSpinner() {
    return <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
}