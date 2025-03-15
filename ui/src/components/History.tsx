import * as React from "react"
import {Decision, HistoryEntry} from "@/state/app-reducer"
import {IndicatorIcon} from "@/components/IndicatorIcon"

type HistoryProps = {
    history: Array<HistoryEntry>
}
export const History = (props: HistoryProps) => {
    if (props.history.length === 0) {
        return (
            <div className="flex flex-col space-y-2 justify-center p-2">
                <p className="text-base font-mono text-gray-500">Transactions pending...</p>
            </div>
        )
    }
    const reversedHistory = props.history.slice().toReversed()
    return (
        <div className="flex flex-col space-y-2 justify-center p-2">


            <div className="grid grid-cols-8 justify-center overflow-scroll text-amber-500 font-mono ">
                {reversedHistory.map((entry) =>
                    <EpochHistory
                        key={entry.epoch}
                        epoch={entry.epoch}
                        decisions={entry.decisions}
                    />
                )}
            </div>
        </div>
    )
}

type EpochHistoryProps = {
    epoch: bigint
    decisions: Map<string, Decision>
}
export const EpochHistory = (props: EpochHistoryProps) => {

    function getConsensusDecision(decisions: Map<string, string>): string {
        const decisionCounts = new Map<string, number>();

        decisions.forEach((decision) => {
          const currentCount = decisionCounts.get(decision) || 0;
          decisionCounts.set(decision, currentCount + 1);
        });

        let consensusDecision = "NO CONSENSUS";

        decisionCounts.forEach((count, decision) => {
          if (count >= 2) {
            consensusDecision = decision;
          }
        });

        return consensusDecision;
      }

      const result = getConsensusDecision(props.decisions);

    return (
        <>
            <div className="col-span-1 text-left"><p>{props.epoch}</p></div>
            <div className="col-span-3 text-left">{result}</div>
            <div className="flex gap-4 col-span-4 text-left">
            <div className="flex gap-2">
            {<IndicatorIcon value={props.decisions.get("human")}/>}
            <span className={`${props.decisions.get("human") === "NO ACTION" ? "text-neutral-500" : "text-amber-500"}`}>
                Trader
            </span>
            </div>
                <div className="flex gap-2">{<IndicatorIcon value={props.decisions.get("liquidity")}/>} Liquidity</div>
                <div className="flex gap-2">{<IndicatorIcon value={props.decisions.get("risk")}/>} Risk</div>
            </div>
        </>
    )
}

