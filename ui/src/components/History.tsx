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
    const PAGE_SIZE = 5
    const [page, setPage] = React.useState(1)
    const totalPages = Math.max(1, Math.ceil(reversedHistory.length / PAGE_SIZE))

    // When new history entries are added, jump back to the first (latest) page
    React.useEffect(() => {
        setPage(1)
    }, [props.history.length])

    React.useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages)
        }
    }, [page, totalPages])

    const start = (page - 1) * PAGE_SIZE
    const pageHistory = reversedHistory.slice(start, start + PAGE_SIZE)

    return (
        <div className="flex flex-col space-y-2 justify-center p-2 overflow-hidden">


            <div className="grid grid-cols-8 justify-center text-amber-500 font-mono max-h-48 overflow-y-scroll">
                {pageHistory.map((entry) =>
                    <EpochHistory
                        key={entry.epoch}
                        epoch={entry.epoch}
                        decisions={entry.decisions}
                    />
                )}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs md:text-sm text-neutral-400">
                <span>
                    Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                    <button
                        type="button"
                        className="px-2 py-1 rounded border border-neutral-700 bg-neutral-900/60 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-800/80"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        Prev
                    </button>
                    <button
                        type="button"
                        className="px-2 py-1 rounded border border-neutral-700 bg-neutral-900/60 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-800/80"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || reversedHistory.length === 0}
                    >
                        Next
                    </button>
                </div>
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

