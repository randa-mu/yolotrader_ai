import * as React from "react"
import {useEffect, useState} from "react"
import {IndicatorIcon} from "@/components/IndicatorIcon"
import {LoadingSpinner} from "@/components/ui/LoadingSpinner"
import {runRiskAnalysis} from "@/lib/risk"
import {AgentDecisionAction, AppState, createAgentDecision} from "@/reducer/app-reducer"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {Button} from "@/components/ui/button"
import {AgentCard} from "@/components/AgentCard"

type AgentRiskProps = {
    appState: AppState
    priceData: Array<number>
    marketSentimentData: Array<string>
    onAgentDecision: (agent: AgentDecisionAction) => unknown
}
export const AgentRisk = (props: AgentRiskProps) => {
    const {epoch} = props.appState
    const [isLoading, setLoading] = useState(true)
    const [reasoning, setReasoning] = useState("")

    const analyseRisk = async () => {
        const risk = await runRiskAnalysis(props.appState)
        props.onAgentDecision(createAgentDecision("risk", risk.decision))
        setReasoning(risk.reason)
    }

    useEffect(() => {
        setLoading(true)
        analyseRisk()
            .finally(() => setLoading(false))
    }, [epoch])

    return (
        <AgentCard isLoading={isLoading}>
            <AgentCard.Title>Risk</AgentCard.Title>
            <AgentCard.Content>
                <IndicatorIcon
                    size="large"
                    value={props.appState.current.get("risk")}
                />
            </AgentCard.Content>
            <AgentCard.Reasoning>{reasoning}</AgentCard.Reasoning>
        </AgentCard>
    )
}
