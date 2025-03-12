import * as React from "react"
import {useCallback, useEffect, useState} from "react"
import {AgentCard} from "@/components/AgentCard"
import {IndicatorIcon} from "@/components/IndicatorIcon"
import {runRiskAnalysis} from "@/lib/risk"
import {AgentDecisionAction, AppState, createAgentDecision} from "@/reducer/app-reducer"
import {TREASURY_POLICY} from "@/data/treasury-policy"
import {Textarea} from "@/components/ui/textarea"
import {Button} from "@/components/ui/button"

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
    const [treasuryPolicy, setTreasuryPolicy] = useState(TREASURY_POLICY)
    const [stagedPolicy, setStagedPolicy] = useState(TREASURY_POLICY)

    const analyseRisk = useCallback(async () => {
        const risk = await runRiskAnalysis(props.appState, treasuryPolicy)
        props.onAgentDecision(createAgentDecision("risk", risk.decision))
        setReasoning(risk.reason)
    }, [props.onAgentDecision, props.appState, treasuryPolicy])

    const resetPolicies = () => {
        setStagedPolicy(TREASURY_POLICY)
        setTreasuryPolicy(TREASURY_POLICY)
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
            <AgentCard.Configuration>
                <div className=" p-2">
                    <Textarea
                        className="min-h-1/2"
                        rows={20}
                        value={stagedPolicy}
                        onChange={event => setStagedPolicy(event.target.value)}
                    />
                    <div className="flex flex-row p-2 gap-2 justify-center">
                        <Button
                            onClick={() => setTreasuryPolicy(stagedPolicy)}
                            disabled={stagedPolicy === treasuryPolicy}
                        >
                            Update
                        </Button>
                        <Button onClick={resetPolicies}>Reset</Button>
                    </div>
                </div>
            </AgentCard.Configuration>
            <AgentCard.Reasoning>{reasoning}</AgentCard.Reasoning>
        </AgentCard>
    )
}
