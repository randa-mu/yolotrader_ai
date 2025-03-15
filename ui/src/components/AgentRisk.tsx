import * as React from "react"
import {Dispatch, useEffect, useState} from "react"
import {AgentCard} from "@/components/AgentCard"
import {IndicatorIcon} from "@/components/IndicatorIcon"
import {runRiskAnalysis} from "@/lib/risk"
import {AppAction, AppState, createAgentDecision} from "@/state/app-reducer"
import {TREASURY_POLICY} from "@/data/treasury-policy"
import {Textarea} from "@/components/ui/textarea"
import {Button} from "@/components/ui/button"
import {ChainState} from "@/state/chain-reducer"
import { NewsData } from "@/data/news"

type AgentRiskProps = {
    appState: AppState
    chainState: ChainState
    priceData: Array<number>
    marketSentimentData: Array<NewsData>
    dispatch: Dispatch<AppAction>
}
export const AgentRisk = (props: AgentRiskProps) => {
    const {epoch} = props.chainState
    const [isLoading, setLoading] = useState(true)
    const [reasoning, setReasoning] = useState("")
    const [treasuryPolicy, setTreasuryPolicy] = useState(TREASURY_POLICY)
    const [stagedPolicy, setStagedPolicy] = useState(TREASURY_POLICY)
    const onAgentDecision = createAgentDecision(props.dispatch)
    // used to abort risk analyses that take too long
    const [abort, setAbort] = useState(new AbortController())

    const resetPolicies = () => {
        setStagedPolicy(TREASURY_POLICY)
        setTreasuryPolicy(TREASURY_POLICY)
    }

    useEffect(() => {
        setLoading(true)
        abort.abort()
        const newAbortController = new AbortController()
        setAbort(newAbortController)

        runRiskAnalysis(newAbortController, props.chainState, treasuryPolicy)
            .then(result => {
                onAgentDecision("risk", result.decision)
                setReasoning(result.reason)
            })
            .finally(() => setLoading(false))
    }, [epoch])

    return (
        <AgentCard isLoading={isLoading} value={props.appState.current.get("risk")}>
            <AgentCard.Title>RISK</AgentCard.Title>
            <AgentCard.Content>
                <IndicatorIcon
                    size="large"
                    value={props.appState.current.get("risk")}
                />
            </AgentCard.Content>
            <AgentCard.Configuration>
                <div className="p-2 rounded-none">
                    <Textarea
                        className="min-h-1/2 rounded-none"
                        rows={20}
                        value={stagedPolicy}
                        onChange={event => setStagedPolicy(event.target.value)}
                    />
                    <div className="flex flex-row py-2 gap-2 justify-center">
                        <Button
                            onClick={() => setTreasuryPolicy(stagedPolicy)}
                            disabled={stagedPolicy === treasuryPolicy}
                            className="grow rounded-none bg-neutral-800 border-radius-0 border border-white text-white font-mono font-semibold"
                        >
                            Update
                        </Button>
                        <Button
                            onClick={resetPolicies}
                            className="grow rounded-none bg-neutral-800 border-radius-0 border border-white text-white font-mono font-semibold"
                        >
                            Reset
                        </Button>
                    </div>
                </div>
            </AgentCard.Configuration>
            <AgentCard.Reasoning>{reasoning}</AgentCard.Reasoning>
        </AgentCard>
    )
}
