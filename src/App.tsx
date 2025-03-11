import * as React from "react"
import {useEffect, useReducer} from "react"
import {appReducer, Decision, initialDecisionState} from "./reducer/app-reducer"
import {History} from "@/components/History"
import {Button} from "@/components/ui/button"
import {EpochCounter} from "@/components/EpochCounter"
import {ActionButtons} from "@/components/ActionButtons"
import {TradingView} from "@/components/TradingView"
import {AgentView} from "@/components/AgentView"
import {PRICE_DATA} from "@/data/price"
import {NEWS_DATA} from "@/data/news"

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
    const onNoAction = () => onAgentAction("HODL")

    useEffect(() => {
        const timerId = setTimeout(nextEpoch, EPOCH_DURATION_MS)
        return () => clearTimeout(timerId)
    }, [epoch])

    if (epoch >= PRICE_DATA.price_data.length) {
        return (
            <div>
                <p>Game over</p>
                <Button onClick={restart}>Restart</Button>
            </div>
        )
    }

    const marketState = {
        price: PRICE_DATA.price_data[epoch - 1].price,
        tweet: NEWS_DATA[epoch - 1].content,
    }

    return (
        <div>
            <h1 className="text-7xl font-extrabold">yolotrader-ai</h1>
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
        </div>
    )
}

export default App
