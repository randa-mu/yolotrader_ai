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
import {APP_CONFIG} from "@/config"
import {signTransfer, testSigning} from "@/lib/signing"

const EPOCH_DURATION_MS = 15000

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

    useEffect(() => {
        console.log("WTF")
        testSigning()
            .then(() => console.log("done"))
            .catch(err => console.error(err))
    }, [])

    if (epoch >= PRICE_DATA.price_data.length) {
        return (
            <div>
                <p>Game over - your portfolio balance was {appState.balances.orderBook} {APP_CONFIG.token}</p>
                <Button onClick={restart}>Restart</Button>
            </div>
        )
    }

    if (appState.balances.treasury <= 0) {
        return (
            <div>
                <p>Your company went broke! Great trading...</p>
                <Button onClick={restart}>Restart</Button>
            </div>
        )
    }

    const priceData = PRICE_DATA.price_data
        .filter(it => it.epoch <= epoch)
        .map(it => it.price)

    const sentimentData = NEWS_DATA
        .filter(it => it.epoch <= epoch)
        .map(it => it.content)

    return (
        <div>
            <div className="absolute left-0 top-0 m-2">
                <EpochCounter epoch={epoch} msPerEpoch={EPOCH_DURATION_MS}/>
            </div>
            <div className="flex-10/12">
                <h1 className=" text-7xl font-extrabold m-10">yolotrader-ai</h1>
            </div>
            <div className="flex flex-row">
                <div className="flex-3/4">
                    <TradingView
                        state={appState}
                        priceData={priceData}
                        sentimentData={sentimentData}
                    />
                </div>
                {/* spacer to make things look nicer */}
                <div className="flex-1/4"></div>
            </div>
            <div className="absolute right-0 top-0 m-2 h-full w-1/4 flex flex-col align-center">
                <div className="w-full h-1/2">
                    <History history={appState.history}/>
                </div>
                <div className="w-full h-1/2">
                    <AgentView
                        state={appState}
                        priceData={priceData}
                        marketSentimentData={sentimentData}
                        onAgentDecision={appDispatch}
                    />
                </div>
            </div>
            <div>
                <ActionButtons
                    epoch={epoch}
                    onBuy={onBuy}
                    onSell={onSell}
                    onNoAction={onNoAction}
                />
            </div>
        </div>
    )
}

export default App
