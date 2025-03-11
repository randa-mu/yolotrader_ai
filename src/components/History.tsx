import * as React from "react"
import {Decision} from "@/reducer/app-reducer"
import {IndicatorIcon} from "@/components/IndicatorIcon"

type HistoryProps = {
    history: Array<Map<string, Decision>>
}
export const History = (props: HistoryProps) => {
    return (
        <div className="min-w-80">
            <h1 className="text-3xl font-extrabold">History</h1>
            <div className="grid grid-cols-4 w-max justify-center">
                <div className="font-extrabold">Epoch</div>
                <div className="font-extrabold">Human</div>
                <div className="font-extrabold">Liquidity</div>
                <div className="font-extrabold">Risk</div>
                {props.history.map((decision, index) => <EpochHistory decision={decision} epoch={index}/>)}
            </div>
        </div>
    )
}

type EpochHistoryProps = {
    epoch: number
    decision: Map<string, Decision>,
}
export const EpochHistory = (props: EpochHistoryProps) => {
    return (
        <>
            <div><p>{props.epoch}</p></div>
            <div>{<IndicatorIcon value={props.decision.get("human")}/>}</div>
            <div>{<IndicatorIcon value={props.decision.get("liquidity")}/>}</div>
            <div>{<IndicatorIcon value={props.decision.get("risk")}/>}</div>
        </>
    )
}

