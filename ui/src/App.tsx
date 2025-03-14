import * as React from "react"
import {useEffect, useReducer} from "react"
import {
    appReducer, AppState,
    createAgentDecision,
    createNewEpochAction,
    initialDecisionState
} from "@/state/app-reducer"
import {History} from "@/components/History"
import {Button} from "@/components/ui/button"
import {EpochCounter} from "@/components/EpochCounter"
import {ActionButtons} from "@/components/ActionButtons"
import {TradingView} from "@/components/TradingView"
import {AgentView} from "@/components/AgentView"
import {PRICE_DATA} from "@/data/price"
import {NEWS_DATA} from "@/data/news"
import {APP_CONFIG} from "@/config"
import {useBlockchain} from "@/state/useBlockchain"
import {tradeIfNecessary} from "@/lib/trade"

function App() {
    const [appState, appDispatch] = useReducer(appReducer, initialDecisionState)
    const [chainState] = useBlockchain()
    const [lastEpochHandled, setLastEpochHandled] = React.useState(0n)
    const [txHash, setTxHash] = React.useState("")

    const restart = () => appDispatch({type: "restart"})
    const onNextEpoch = createNewEpochAction(appDispatch)
    const onAgentAction = createAgentDecision(appDispatch)

    // we propagate epochs between the states
    useEffect(() => {
        onNextEpoch(chainState.epoch)
    }, [chainState.epoch])

    // this listens for epoch changes and submits txs based on te decisions of agents
    useEffect(() => {
        tradeIfNecessary(chainState, appState)
            .then(setTxHash)
            .catch(err => console.error(err))
            .finally(() => setLastEpochHandled(chainState.epoch))

    }, [appState.current, chainState.epoch])

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
                <EpochCounter
                    epoch={chainState.epoch}
                    msPerEpoch={APP_CONFIG.msPerEpoch}
                />
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
                        dispatch={appDispatch}
                    />
                </div>
            </div>
            <div>
                <ActionButtons
                    epoch={chainState.epoch}
                    onBuy={() => onAgentAction("human", "BUY")}
                    onSell={() => onAgentAction("human", "SELL")}
                    onNoAction={() => onAgentAction("human", "HODL")}
                />
            </div>
            {!!txHash && <div><p>Transaction sent with hash {txHash}</p></div>}
        </div>
    )
}

export default App
