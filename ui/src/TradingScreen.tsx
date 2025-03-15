import * as React from "react"
import {useEffect, useReducer} from "react"
import {appReducer, Decision, initialDecisionState} from "./reducer/app-reducer"
import {History} from "@/components/History"
import {Button} from "@/components/ui/button"
import {EpochCounter} from "@/components/EpochCounter"
import {ActionButtons} from "@/components/ActionButtons"
import {TradingView} from "@/components/TradingView"
import {AgentView} from "@/components/AgentView"
import {TradingHeader} from "@/components/TradingHeader"
import {PRICE_DATA} from "@/data/price"
import {NEWS_DATA} from "@/data/news"
import {APP_CONFIG} from "@/config"
import RandamuLogo from  "./assets/randamu_logo.svg"

const EPOCH_DURATION_MS = 15000

function TradingScreen() {
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
        .map(it => it)

    return (
        <div className="flex flex-col h-screen max-h-screen overflow-hidden">
            <header className="top-0 w-full flex flex-row content-start p-4 px-8 text-left font-display text-2xl font-semibold text-white">
                <img src={RandamuLogo} alt="Icon" className="w-10 h-10" />
                <span className="ml-3">randamu</span>
                <span className="ml-3 font-medium">| Yolotrader-AI</span>
                <span className="grow text-right text-lg font-light">Exit</span>
            </header>
            <main className="h-full grid justify-items-center px-8 pb-8">
                <div className="w-full h-full max-w-400 rounded-md bg-neutral-700 border-1 border-neutral-500 p-6">
                    <div className="w-full h-full rounded-sm bg-black p-2">
                    <div className="w-full h-full flex flex-col rounded-xs border-3 border-amber-500 p-2">
                        <TradingHeader state={appState} priceData={priceData} sentimentData={sentimentData} epoch={epoch} EPOCH_DURATION_MS={EPOCH_DURATION_MS} />
                        <div className="w-full h-full flex gap-2">
                            <TradingView state={appState} priceData={priceData} sentimentData={sentimentData}/>
                            <div className="flex-col">
                                <AgentView
                                    state={appState}
                                    priceData={priceData}
                                    marketSentimentData={sentimentData}
                                    onAgentDecision={appDispatch}
                                />
                                <div className="basis-2/5 flex flex-col border border-neutral-800">
                                    <div className="w-full p-1 px-2 gap-2 bg-neutral-800 font-mono text-sm text-left text-neutral-400">
                                        <span className="">Trader actions</span>
                                    </div> 
                                    <ActionButtons 
                                        epoch={epoch}
                                        onBuy={onBuy}
                                        onSell={onSell}
                                        onNoAction={onNoAction}
                                        msPerEpoch={EPOCH_DURATION_MS}
                                    />
                                </div>
                                <div className="basis-2/5 flex flex-col border border-neutral-800">
                                    <div className="w-full p-1 px-2 gap-2 bg-neutral-800 font-mono text-sm text-left text-neutral-400">
                                        <span className="">Transaction History</span>
                                    </div> 
                                    <History history={appState.history} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div> 
                </div> 
                <img
                src="/assets/trader.png" 
                alt="Trader"
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-10 w-[400px]"
                />
            </main>
        </div>
    )
}

export default TradingScreen


