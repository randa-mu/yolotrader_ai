import * as React from "react"
import {AppAction, AppState, createAgentDecision, Decision} from "@/state/app-reducer"
import {IndicatorIcon} from "@/components/IndicatorIcon"
import {Dispatch, useCallback, useEffect, useState} from "react"
import {AgentCard} from "@/components/AgentCard"
import { NewsData } from "@/data/news"

type AgentLiquidityProps = {
    appState: AppState
    priceData: Array<number>
    marketSentimentData: Array<NewsData>
    dispatch: Dispatch<AppAction>
}
export const AgentLiquidity = (props: AgentLiquidityProps) => {
    const {epoch} = props.appState
    const [isLoading, setLoading] = useState(true)
    const onAgentDecision = useCallback(createAgentDecision(props.dispatch), [props.dispatch])

    useEffect(() => {
        if (!props.dispatch) {
            return
        }
        const randomLatency = Math.random() * 4000
        // we mock the liquidity agent for now
        setTimeout(
            () => {
                onAgentDecision("liquidity", randomDecision())
                setLoading(false)
            },
            randomLatency
        )
    }, [epoch, props.dispatch])

    return (
        <AgentCard isLoading={isLoading} value={props.appState.current.get("liquidity")}>
            <AgentCard.Title>LIQUIDITY</AgentCard.Title>
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

