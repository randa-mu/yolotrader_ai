import * as React from "react"
import {AgentDecisionAction, AppState, createAgentDecision, Decision} from "@/state/app-reducer"
import {IndicatorIcon} from "@/components/IndicatorIcon"
import {useEffect, useState} from "react"
import {LoadingSpinner} from "@/components/ui/LoadingSpinner"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {Button} from "@/components/ui/button"
import {AgentCard} from "@/components/AgentCard"

type AgentLiquidityProps = {
    appState: AppState
    priceData: Array<number>
    marketSentimentData: Array<string>
    onAgentDecision: (agent: AgentDecisionAction) => unknown
}
export const AgentLiquidity = (props: AgentLiquidityProps) => {
    const {epoch} = props.appState
    const [isLoading, setLoading] = useState(true)

    useEffect(() => {
        const randomLatency = Math.random() * 4000
        // we mock the liquidity agent for now
        setTimeout(
            () => {
                props.onAgentDecision(createAgentDecision("liquidity", randomDecision()))
                setLoading(false)
            },
            randomLatency
        )
    }, [epoch])

    return (
        <AgentCard isLoading={isLoading}>
            <AgentCard.Title>Liquidity</AgentCard.Title>
            <AgentCard.Content>
                <IndicatorIcon
                    size="large"
                    value={props.appState.current.get("liquidity")}
                />
            </AgentCard.Content>
            <AgentCard.Reasoning>
                <p>Threshold was reached by the dcipher network</p>
            </AgentCard.Reasoning>
        </AgentCard>
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

