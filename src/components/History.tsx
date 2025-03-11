import * as React from "react"
import {Decision} from "@/reducer/app-reducer"
import {IndicatorIcon} from "@/components/Indicators"

type HistoryProps = {
    history: Array<Map<string, Decision>>
}
export const History = (props: HistoryProps) => {
    return (
        <>
            <h1 className="text-3xl font-extrabold">History</h1>
            {props.history.map((decision, index) => <EpochHistory decision={decision} epoch={index}/>)}
        </>
    )
}

type EpochHistoryProps = {
    epoch: number
    decision: Map<string, Decision>,
}
export const EpochHistory = (props: EpochHistoryProps) => {
    return (
        <div className="inline-flex flex-row gap-2 w-max justify-center">
            <div><h2 className="font-extrabold">Epoch {props.epoch}</h2></div>
            <div>Human</div>
            <div>{
                <IndicatorIcon value={props.decision.get("human")}/>
            }</div>
            <div>Liquidity</div>
            <div>{
                <IndicatorIcon value={props.decision.get("liquidity")}/>
            }</div>
            <div>Risk</div>
            <div>{
                <IndicatorIcon value={props.decision.get("risk")}/>
            }</div>
        </div>
    )
}

