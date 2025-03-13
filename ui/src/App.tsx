import * as React from "react"
import {useEffect, useReducer} from "react"
import {appReducer, Decision, initialDecisionState} from "@/state/app-reducer"
import {History} from "@/components/History"
import {Button} from "@/components/ui/button"
import {EpochCounter} from "@/components/EpochCounter"
import {ActionButtons} from "@/components/ActionButtons"
import {TradingView} from "@/components/TradingView"
import {AgentView} from "@/components/AgentView"
import {PRICE_DATA} from "@/data/price"
import {NEWS_DATA} from "@/data/news"
import {APP_CONFIG} from "@/config"
import {testSigning} from "@/lib/signing"
import {useBlockchain} from "@/state/useBlockchain"

const EPOCH_DURATION_MS = 15000

function App() {
    const [appState, appDispatch] = useReducer(appReducer, initialDecisionState)
    const [chainState] = useBlockchain()

    const restart = () => appDispatch({type: "restart"})
    const nextEpoch = () => appDispatch({type: "new_epoch"})
    const onAgentAction = (decision: Decision) => appDispatch({type: "agent_action", agent: "human", decision})
    const onBuy = () => onAgentAction("BUY")
    const onSell = () => onAgentAction("SELL")
    const onNoAction = () => onAgentAction("HODL")

    useEffect(() => {
        const timerId = setTimeout(nextEpoch, EPOCH_DURATION_MS)
        return () => clearTimeout(timerId)
    }, [chainState.epoch])

    useEffect(() => {
        testSigning(chainState.treasury.nonce)
            .then(() => console.log("done"))
            .catch(err => console.error(err))
    }, [chainState.treasury.nonce])

    if (chainState.epoch === 0n) {
        return <div>Loading...</div>
    }

    if (chainState.epoch >= PRICE_DATA.price_data.length) {
        return (
            <div>
                <p>Game over - your portfolio balance was {chainState.orderbook.balance} {APP_CONFIG.token}</p>
                <Button onClick={restart}>Restart</Button>
            </div>
        )
    }

    const priceData = PRICE_DATA.price_data
        .filter(it => it.epoch <= chainState.epoch)
        .map(it => it.price)

    const sentimentData = NEWS_DATA
        .filter(it => it.epoch <= chainState.epoch)
        .map(it => it.content)

    return (
        <div>
            <div className="absolute left-0 top-0 m-2">
                <EpochCounter epoch={chainState.epoch} msPerEpoch={EPOCH_DURATION_MS}/>
            </div>
            <div className="flex-10/12">
                <h1 className=" text-7xl font-extrabold m-10">yolotrader-ai</h1>
            </div>
            <div className="flex flex-row">
                <div className="flex-3/4">
                    <TradingView
                        appState={appState}
                        chainState={chainState}
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
                        chainState={chainState}
                        priceData={priceData}
                        marketSentimentData={sentimentData}
                        onAgentDecision={appDispatch}
                    />
                </div>
            </div>
            <div>
                <ActionButtons
                    epoch={chainState.epoch}
                    onBuy={onBuy}
                    onSell={onSell}
                    onNoAction={onNoAction}
                />
            </div>
        </div>
    )
}

export default App
