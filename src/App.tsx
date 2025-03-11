import * as React from "react"
import {useEffect, useReducer} from "react"
import {DATA} from "./reducer/data.js"
import {appReducer, Decision, initialDecisionState} from "./reducer/appReducer"
import {History} from "@/components/History"
import {Button} from "@/components/ui/button"
import {EpochCounter} from "@/components/EpochCounter"
import {ActionButtons} from "@/components/ActionButtons"
import {TradingView} from "@/components/TradingView"
import {AgentStatus} from "@/components/AgentStatus"
import {AgentView} from "@/components/AgentView"

const EPOCH_DURATION_MS = 5000

function App() {
    const [appState, appDispatch] = useReducer(appReducer, initialDecisionState)
    const epoch = appState.epoch

    const restart = () =>
        appDispatch({type: "restart"})
    const nextEpoch = () =>
        appDispatch({type: "new_epoch"})
    const onAgentAction = (decision: Decision) => {
        appDispatch({type: "agent_action", agent: "human", decision})
    }

    const onBuy = () => onAgentAction("BUY")
    const onSell = () => onAgentAction("SELL")
    const onNoAction = () => onAgentAction("NO ACTION")

    useEffect(() => {
        const timerId = setTimeout(nextEpoch, EPOCH_DURATION_MS)
        return () => clearTimeout(timerId)
    }, [epoch])

    if (epoch >= DATA.length) {
        return (
            <div>
                <p>Game over</p>
                <Button onClick={restart}>Restart</Button>
            </div>
        )
    }

    const marketState = DATA[epoch]

    return (
        <div className="flex flex-row">
            <div className="flex-1/8">
                <EpochCounter epoch={epoch} msPerEpoch={EPOCH_DURATION_MS}/>
            </div>
            <div className="flex-3/4">
                <TradingView
                    state={appState}
                    marketState={marketState}
                />
                <AgentView
                    state={appState}
                    marketState={marketState}
                    onAgentDecision={appDispatch}
                />
                <ActionButtons
                    epoch={epoch}
                    onBuy={onBuy}
                    onSell={onSell}
                    onNoAction={onNoAction}
                />

            </div>

            <div className="flex-1/8">
                <History history={appState.history}/>
            </div>
        </div>
    )
}

export default App
