import * as React from "react"
import {Decision} from "@/reducer/app-reducer"
import {IndicatorIcon} from "@/components/IndicatorIcon"

type HistoryProps = {
    history: Array<Map<string, Decision>>
}
export const History = (props: HistoryProps) => {
    if (props.history.length === 0) {
        return (
            <div className="flex flex-col space-y-2 justify-center p-2">
                <h1 className="text-3xl font-extrabold">History</h1>
                <p>Waiting for decisions...</p>
            </div>
        )
    }
    const reversedHistory = props.history.map((decision, index) => ({decision, epoch: index})).toReversed()
    return (
        <div className="flex flex-col space-y-2 justify-center p-2">
            <h1 className="text-3xl font-extrabold">History</h1>

            <div className="grid grid-cols-4 justify-center overflow-scroll">
                <div className="font-extrabold">Epoch</div>
                <div className="font-extrabold">Human</div>
                <div className="font-extrabold">Liquidity</div>
                <div className="font-extrabold">Risk</div>
                {reversedHistory.map(({decision, epoch}) =>
                    <EpochHistory
                        key={epoch}
                        decision={decision}
                        epoch={epoch}
                    />
                )}
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

