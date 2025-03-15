import * as React from "react"
import {useEffect, useReducer, useState} from "react"
import {History} from "@/components/History"
import {Button} from "@/components/ui/button"
import {ActionButtons} from "@/components/ActionButtons"
import {TradingView} from "@/components/TradingView"
import {AgentView} from "@/components/AgentView"
import {TradingHeader} from "@/components/TradingHeader"
import {PRICE_DATA} from "@/data/price"
import {NEWS_DATA} from "@/data/news"
import {APP_CONFIG} from "@/config"
import RandamuLogo from "../public/assets/randamu_logo.svg"
import {
    appReducer,
    createAgentDecision,
    createNewEpochAction,
    initialDecisionState
} from "@/state/app-reducer"
import {useBlockchain} from "./state/useBlockchain"

const EPOCH_DURATION_MS = 15000

// Introduction messages for start screen
const introMessages = [
    "Welcome to YoloTrader-AI! Where 'financial expertise' means frantically buying whatever Reddit tells you to!",

    "Prepare to ride the MOON rocket! Remember: Buy high, sell low... Wait, that's not right...",

    "Congratulations on your new role as Chief YOLO Officer! Your strategy of checking horoscopes before trading is exactly what we're looking for!",

    "Welcome to cryptocurrency trading! Where the charts are made up and fundamentals don't matter!",

    "Your mission: Turn digital money into more digital money without having a digital breakdown!",

    "You've been appointed as Head Trader at MoonLambo Capital. Your qualifications? You once posted 'to the moon 🚀🚀🚀' on Twitter."
];

const bankruptcyMessages = [
    "Your company went broke! Your trading strategy was about as effective as using a Magic 8-Ball... Actually, the Magic 8-Ball might have done better.",

    "BANKRUPT! Turns out 'diamond hands' was just a fancy term for 'watching money evaporate'!",

    "Game Over! You've successfully turned your fortune into digital dust. Have you considered a career in professional coin-flipping?",

    "MOON mission failed! Your rocket crashed and burned. The good news? Your loss screenshots will get tons of upvotes on Reddit!",

    "Your company is broke! On the bright side, you can now honestly tell people you have 'experience in liquidation'.",

    "Financial extinction achieved! You've boldly gone where many traders have gone before... to zero!",

    "Game Over! The market played you like a fiddle. A very expensive, now-repossessed fiddle."
];

function TradingScreen() {
    const [appState, appDispatch] = useReducer(appReducer, initialDecisionState)
    const [chainState] = useBlockchain()
    const [gameStarted, setGameStarted] = useState(false)
    const epoch = appState.epoch
    const finalBalance = chainState.orderbook.balance

    function getBalanceMessage(finalBalance) {
        const percentChange = ((finalBalance - 1) / 1) * 100;

        if (percentChange <= -80) {
            return `Game over - your portfolio balance was ${finalBalance} ${APP_CONFIG.token}. Impressive! You've turned investing into an extreme sport - extremely painful.`;
        } else if (percentChange <= -50) {
            return `Game over - your portfolio balance was ${finalBalance} ${APP_CONFIG.token}. The good news is you still have enough left to print 'Financial Genius' on your business cards!`;
        } else if (percentChange <= -20) {
            return `Game over - your portfolio balance was ${finalBalance} ${APP_CONFIG.token}. Not terrible, not great. Just like your trading strategy.`;
        } else if (percentChange <= 0) {
            return `Game over - your portfolio balance was ${finalBalance} ${APP_CONFIG.token}. Congratulations on your contribution to someone else's yacht fund!`;
        } else if (percentChange <= 20) {
            return `Game over - your portfolio balance was ${finalBalance} ${APP_CONFIG.token}. You beat inflation! Barely. But hey, that's something!`;
        } else if (percentChange <= 50) {
            return `Game over - your portfolio balance was ${finalBalance} ${APP_CONFIG.token}. Not bad! You could almost afford one of those JPEGs everyone's talking about.`;
        } else if (percentChange <= 100) {
            return `Game over - your portfolio balance was ${finalBalance} ${APP_CONFIG.token}. Warren Buffett is nervously checking your LinkedIn profile right now.`;
        } else {
            return `Game over - your portfolio balance was ${finalBalance} ${APP_CONFIG.token}. MOONSHOT CONFIRMED! You either have insider information or incredible luck. Either way, we're calling the SEC.`;
        }
    }

    const startGame = () => {
        setGameStarted(true)
    }

    const restart = () => appDispatch({type: "restart"})
    const onNextEpoch = createNewEpochAction(appDispatch)
    const onAgentAction = createAgentDecision(appDispatch)

    // we propagate epochs between the states and update the price/sentiment data
    useEffect(() => {
        onNextEpoch(chainState.epoch)
    }, [chainState.epoch])

    useEffect(() => {
        if (gameStarted) {
            const timerId = setTimeout(onNextEpoch, EPOCH_DURATION_MS)
            return () => clearTimeout(timerId)
        }
    }, [epoch, gameStarted])

    const StartScreen = () => {
        const message = introMessages[Math.floor(Math.random() * introMessages.length)];

        return (
            <div className="fixed inset-0 flex-col items-center justify-center z-50 bg-black">
                <header
                    className="top-0 w-full flex flex-row content-start p-4 px-8 text-left font-display text-2xl font-semibold text-white">
                    <img src={RandamuLogo} alt="Icon" className="w-10 h-10"/>
                    <span className="ml-3">randamu</span>
                    <span className="ml-3 font-medium">| Yolotrader-AI</span>
                </header>
                <div className="bg-black border-2 border-amber-500 p-8 rounded-md text-center max-w-2xl mx-auto">
                    <h2 className="text-amber-500 text-4xl font-mono font-bold mb-6">
                        YOLOTRADER AI
                    </h2>

                    <p className="text-amber-400 text-xl font-mono mb-8">
                        {message}
                    </p>

                    <div className="mb-8 text-amber-300 font-mono">
                        <p className="mb-2">• You start with 100,000 MOON tokens</p>
                        <p className="mb-2">• BUY, SELL or HODL based on market conditions</p>
                        <p className="mb-2">• Watch for news that might affect the market</p>
                        <p>• Don't go broke. Seriously, that's embarrassing.</p>
                    </div>

                    <Button
                        onClick={startGame}
                        className="bg-amber-600 hover:bg-amber-700 text-black px-8 py-3 rounded-md font-mono text-lg mt-4"
                    >
                        Start Trading!
                    </Button>

                    <div className="text-amber-600 text-sm mt-4 font-mono">
                        Warning: No actual financial advice contained herein. Just pixels and bad jokes.
                    </div>
                </div>
            </div>
        );
    }

    const GameOverScreen = ({isBankrupt = false}) => {
        const message = isBankrupt
            ? bankruptcyMessages[Math.floor(Math.random() * bankruptcyMessages.length)]
            : getBalanceMessage(finalBalance);

        return (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-90">
                <div className="bg-black border-2 border-amber-500 p-8 rounded-md text-center max-w-2xl mx-auto">
                    <h2 className="text-amber-500 text-4xl font-mono font-bold mb-6">
                        {isBankrupt ? "BANKRUPTCY!" : "GAME OVER"}
                    </h2>

                    <p className="text-amber-400 text-xl font-mono mb-8">
                        {message}
                    </p>

                    <Button
                        onClick={restart}
                        className="bg-amber-600 hover:bg-amber-700 text-black px-8 py-3 rounded-md font-mono text-lg mt-4"
                    >
                        Trade Again?
                    </Button>
                </div>
            </div>
        );
    }

    // Show start screen if game hasn't started
    if (!gameStarted) {
        return <StartScreen/>
    }

    // Game over condition
    if (epoch >= PRICE_DATA.price_data.length) {
        return <GameOverScreen isBankrupt={false}/>
    }

    // Bankruptcy condition
    if (chainState.treasury.balance <= 0) {
        return <GameOverScreen isBankrupt={true}/>
    }

    const priceData = PRICE_DATA.price_data
        .filter(it => it.epoch <= epoch)
        .map(it => it.price)

    const sentimentData = NEWS_DATA
        .filter(it => it.epoch <= epoch)
        .map(it => it)

    return (
        <div className="flex flex-col h-screen max-h-screen overflow-hidden">
            <header
                className="top-0 w-full flex flex-row content-start p-4 px-8 text-left font-display text-2xl font-semibold text-white">
                <img src={RandamuLogo} alt="Icon" className="w-10 h-10"/>
                <span className="ml-3">randamu</span>
                <span className="ml-3 font-medium">| Yolotrader-AI</span>
                <span className="grow text-right text-lg font-light">Exit</span>
            </header>
            <main className="h-full grid justify-items-center px-8 pb-8">
                <div className="w-full h-full max-w-400 rounded-md bg-neutral-700 border-1 border-neutral-500 p-6">
                    <div className="w-full h-full rounded-sm bg-black p-2">
                        <div className="w-full h-full flex flex-col rounded-xs border-3 border-amber-500 p-2">
                            <TradingHeader
                                state={appState}
                                chainState={chainState}
                                priceData={priceData}
                                sentimentData={sentimentData}
                                epoch={epoch}
                                EPOCH_DURATION_MS={EPOCH_DURATION_MS}
                            />
                            <div className="w-full h-full flex gap-2">
                                <TradingView
                                    state={appState}
                                    chainState={chainState}
                                    priceData={priceData}
                                    sentimentData={sentimentData}
                                />
                                <div className="flex-col basis-2/5">
                                    <AgentView
                                        state={appState}
                                        chainState={chainState}
                                        priceData={priceData}
                                        marketSentimentData={sentimentData}
                                        dispatch={appDispatch}
                                    />
                                    <div className="basis-2/5 flex flex-col border border-neutral-800">
                                        <div
                                            className="w-full p-1 px-2 gap-2 bg-neutral-800 font-mono text-sm text-left text-neutral-400">
                                            <span className="">Trader actions</span>
                                        </div>
                                        <ActionButtons
                                            epoch={epoch}
                                            onBuy={() => onAgentAction("human", "BUY")}
                                            onSell={() => onAgentAction("human", "SELL")}
                                            onNoAction={() => onAgentAction("human", "HODL")}
                                        />
                                    </div>
                                    <div className="basis-2/5 flex flex-col border border-neutral-800">
                                        <div
                                            className="w-full p-1 px-2 gap-2 bg-neutral-800 font-mono text-sm text-left text-neutral-400">
                                            <span className="">Transaction History</span>
                                            <div
                                                className="w-full py-1 grid grid-cols-8 gap-2 bg-neutral-800 font-mono text-neutral-400">
                                                <span className="col-span-1">Epoch</span>
                                                <span className="col-span-3">Trade</span>
                                                <span className="col-span-3">Agent Decisions</span>
                                            </div>
                                        </div>
                                        <History history={appState.history}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <img
                    src="/assets/trader.png"
                    alt="Trader"
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-10 w-[1500px] h-auto max-w-none pointer-events-none"
                />
            </main>
        </div>
    )
}

export default TradingScreen
