import * as React from "react"
import {useEffect, useState} from "react"
import {IndicatorIcon} from "@/components/IndicatorIcon"
import {runRiskAnalysis} from "@/lib/risk"
import {Agent, AgentDecisionAction, AppState, createAgentDecision, Decision} from "@/reducer/app-reducer"

type AgentStatusProps = {
    agent: Agent
    appState: AppState
    priceData: Array<number>
    marketSentimentData: Array<string>
    onAgentDecision: (agent: AgentDecisionAction) => unknown
}
export const AgentStatus = (props: AgentStatusProps) => {
    const {epoch} = props.appState
    const [isLoading, setLoading] = useState(true)

    useEffect(() => {
        const randomLatency = Math.random() * 4000
        if (props.agent === "risk") {
            setLoading(true)
            runRiskAnalysis(props.appState)
                .then(risk =>
                    props.onAgentDecision(createAgentDecision(props.agent, risk.decision))
                )
                .finally(() => setLoading(false))

        } else {
            // we mock the liquidity agent for now
            setTimeout(
                () => {
                    props.onAgentDecision(createAgentDecision(props.agent, randomDecision()))
                    setLoading(false)
                },
                randomLatency
            )
        }
    }, [epoch])

    const cleanName = props.agent.charAt(0).toUpperCase() + props.agent.slice(1).toLowerCase()
    return (
        <div className="grid grid-cols-2 space-x-2 p-2 min-h-20 min-w-20 text-center align-middle">
            <div className="text-2xl font-extrabold align-middle text-center">{cleanName}</div>
            <div>
                {isLoading
                    ? <LoadingSpinner/>
                    : <IndicatorIcon
                        size="large"
                        value={props.appState.current.get(props.agent)}
                    />
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
    return "HODL"
}

function LoadingSpinner() {
    return (
        <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
        </div>
    )

}