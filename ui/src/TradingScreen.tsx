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
import RandamuLogo from "@/assets/randamu_logo.svg"
import {
    appReducer,
    createAgentDecision,
    createNewEpochAction,
    initialDecisionState
} from "@/state/app-reducer"
import {useBlockchain} from "./state/useBlockchain"
import {tradeIfNecessary} from "@/lib/trade"

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
    const finalBalance = chainState.orderbook.balance

    function getBalanceMessage(finalBalance) {
        // Convert BigInt to Number for calculations
        const balanceNum = Number(finalBalance);
        const percentChange = ((balanceNum - 1) / 1) * 100;
        // Format BigInt for display
        const balanceDisplay = finalBalance.toString();

        if (percentChange <= -80) {
            return `Game over - your portfolio balance was ${balanceDisplay} ${APP_CONFIG.token}. Impressive! You've turned investing into an extreme sport - extremely painful.`;
        } else if (percentChange <= -50) {
            return `Game over - your portfolio balance was ${balanceDisplay} ${APP_CONFIG.token}. The good news is you still have enough left to print 'Financial Genius' on your business cards!`;
        } else if (percentChange <= -20) {
            return `Game over - your portfolio balance was ${balanceDisplay} ${APP_CONFIG.token}. Not terrible, not great. Just like your trading strategy.`;
        } else if (percentChange <= 0) {
            return `Game over - your portfolio balance was ${balanceDisplay} ${APP_CONFIG.token}. Congratulations on your contribution to someone else's yacht fund!`;
        } else if (percentChange <= 20) {
            return `Game over - your portfolio balance was ${balanceDisplay} ${APP_CONFIG.token}. You beat inflation! Barely. But hey, that's something!`;
        } else if (percentChange <= 50) {
            return `Game over - your portfolio balance was ${balanceDisplay} ${APP_CONFIG.token}. Not bad! You could almost afford one of those JPEGs everyone's talking about.`;
        } else if (percentChange <= 100) {
            return `Game over - your portfolio balance was ${balanceDisplay} ${APP_CONFIG.token}. Warren Buffett is nervously checking your LinkedIn profile right now.`;
        } else {
            return `Game over - your portfolio balance was ${balanceDisplay} ${APP_CONFIG.token}. MOONSHOT CONFIRMED! You either have insider information or incredible luck. Either way, we're calling the SEC.`;
        }
    }

    const startGame = () => {
        setGameStarted(true)
    }

    const restart = () => {
        setGameStarted(false)
        appDispatch({type: "restart"})
    }
    const onNextEpoch = createNewEpochAction(appDispatch)
    const onAgentAction = createAgentDecision(appDispatch)

    // we propagate epochs between the states and update the price/sentiment data
    useEffect(() => {
        // we trade before setting the new app state around epoch (so it doesn't reset)
        tradeIfNecessary(chainState, appState)
            .then(tx => console.log(`tx sent with hash ${tx}`))
        onNextEpoch(chainState.epoch)
    }, [chainState.epoch])

    const StartScreen = () => {
        const message = introMessages[Math.floor(Math.random() * introMessages.length)];

        return (
            <div className="min-h-screen bg-brand-dark bg-black-pattern bg-cover bg-center text-brand-light font-funnel-display flex flex-col">
                <header className="w-full flex items-center gap-3 px-8 md:px-16 pt-8">
                    <img src={RandamuLogo} alt="Randamu logo" className="w-10 h-10" />
                    <span className="text-lg md:text-xl font-medium">randamu</span>
                    <span className="text-lg md:text-xl font-light text-muted ml-1">| YoloTrader-AI</span>
                </header>

                <main className="flex-1 flex flex-col lg:flex-row lg:items-center justify-between px-8 md:px-16 lg:px-24 lg: py-8 gap-0 lg:gap-24">
                    <section className="max-w-xl space-y-6 text-left">
                        <h1 className="font-funnel-display text-4xl md:text-5xl lg:text-6xl leading-tight text-brand-light">
                            YOLOTRADER AI
                        </h1>
                        <p className="text-base md:text-lg text-muted leading-relaxed">
                            {message}
                        </p>

                        <div className="pt-2 text-xl text-white space-y-2 font-funnel-display">
                            <p className="flex items-center gap-2">
                                <img
                                    src="/assets/images/cursor.svg"
                                    alt="Bullet"
                                    className="h-5 w-5 pt-1"
                                />
                                <span>You start with 10,000,000 MOON tokens</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <img
                                    src="/assets/images/cursor.svg"
                                    alt="Bullet"
                                    className="h-5 w-5 pt-1"
                                />
                                <span>React to the market, make moves or chill</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <img
                                    src="/assets/images/cursor.svg"
                                    alt="Bullet"
                                    className="h-5 w-5 pt-1"
                                />
                                <span>Watch for news that might affect the market</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <img
                                    src="/assets/images/cursor.svg"
                                    alt="Bullet"
                                    className="h-5 w-5 pt-1"
                                />
                                <span>Don&apos;t go broke. Seriously, that&apos;s embarrassing</span>
                            </p>
                        </div>

                        <div className="mt-8">
                            <Button
                                onClick={startGame}
                                className="group inline-flex items-center gap-3 text-red-500 hover:text-red-400 bg-transparent hover:bg-transparent px-0 py-0 text-xl font-semibold"
                            >
                                <img
                                    src="/assets/images/redarrow.svg"
                                    alt="Spin arrow"
                                    className="h-6 w-auto"
                                />
                                <span className="cursor-pointer decoration-red-500 group-hover:decoration-red-400 font-funnel-display text-2xl">
                                    Start Trading
                                </span>
                            </Button>
                        </div>

                        <div className="text-xs md:text-sm text-muted mt-3 font-funnel-display">
                            Warning: No actual financial advice contained herein. Just pixels and bad jokes.
                        </div>
                    </section>

                    <section className="flex-1 flex justify-center items-center">
                        <img
                            src="/assets/images/candlestick.png"
                            alt="Candlestick chart"
                            className="max-h-[22rem] w-auto"
                        />
                    </section>
                </main>
            </div>
        );
    }

    const GameOverScreen = ({isBankrupt = false}) => {
        const message = isBankrupt
            ? bankruptcyMessages[Math.floor(Math.random() * bankruptcyMessages.length)]
            : getBalanceMessage(finalBalance);

        return (
            <div className="min-h-screen bg-yellow-pattern bg-cover bg-center text-brand-light font-funnel-display flex flex-col">
                <header className="w-full flex items-center gap-3 px-8 md:px-16 pt-8">
                    <img src={RandamuLogo} alt="Randamu logo" className="w-10 h-10" />
                    <span className="text-lg md:text-xl font-medium">randamu</span>
                    <span className="text-lg md:text-xl font-light text-muted ml-1">| YoloTrader-AI</span>
                </header>

                <main className="flex-1 flex items-center justify-center px-8 md:px-16">
                    <div className="max-w-3xl w-full space-y-8 text-center">
                        <h2 className="text-red-500 text-5xl md:text-6xl lg:text-7xl font-funnel-display font-bold">
                            {isBankrupt ? "BANKRUPTCY!" : "GAME OVER"}
                        </h2>

                        <p className="text-red-400 text-xl md:text-2xl font-funnel-display leading-relaxed">
                            {message}
                        </p>

                        <div className="mt-12">
                            <Button
                                onClick={restart}
                                className="group inline-flex items-center gap-3 text-red-500 hover:text-red-400 bg-transparent hover:bg-transparent px-0 py-0 text-xl font-semibold border-0"
                            >
                                <img
                                    src="/assets/images/redarrow.svg"
                                    alt="Restart arrow"
                                    className="h-6 w-auto"
                                />
                                <span className="cursor-pointer decoration-red-500 group-hover:decoration-red-400 font-funnel-display text-2xl">
                                    Trade Again?
                                </span>
                            </Button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (!gameStarted) {
        return <StartScreen/>
    }

    if (chainState.epoch >= PRICE_DATA.price_data.length) {
        return <GameOverScreen isBankrupt={false}/>
    }

    if (chainState.treasury.balance <= 0) {
        return <GameOverScreen isBankrupt={true}/>
    }

    const priceData = PRICE_DATA.price_data
        .filter(it => it.epoch <= chainState.epoch)
        .map(it => it.price)

    const sentimentData = NEWS_DATA
        .filter(it => it.epoch <= chainState.epoch)
        .map(it => it)

        return (
        <div className="flex flex-col min-h-screen bg-black-pattern bg-cover bg-center text-brand-light font-funnel-display">
            <header className="w-full flex items-center gap-3 px-8 md:px-16 pt-6 pb-4">
                <img src={RandamuLogo} alt="Icon" className="w-10 h-10" />
                <span className="text-lg md:text-xl font-medium">randamu</span>
                <span className="text-lg md:text-xl font-light text-muted ml-1">| YoloTrader-AI</span>
                <button 
                    onClick={restart}
                    className="grow text-right text-sm md:text-base font-light text-muted hover:text-white cursor-pointer"
                >
                    Exit
                </button>
            </header>
            <main className="flex-1 w-full pb-6 px-8 md:px-16">
                <div className="w-full h-full">
                    <div className="w-full h-full">
                        <div className="w-full h-full flex flex-col">
                            <TradingHeader
                                state={appState}
                                chainState={chainState}
                                priceData={priceData}
                                sentimentData={sentimentData}
                                epoch={chainState.epoch}
                                EPOCH_DURATION_MS={EPOCH_DURATION_MS}
                            />
                            <div className="w-full h-full flex flex-col lg:flex-row gap-3 pb-4">
                                <TradingView
                                    appState={appState}
                                    chainState={chainState}
                                    priceData={priceData}
                                    sentimentData={sentimentData}
                                />
                                <div className="flex-col md:basis-2/5 space-y-3">
                                    <AgentView
                                        state={appState}
                                        chainState={chainState}
                                        priceData={priceData}
                                        marketSentimentData={sentimentData}
                                        dispatch={appDispatch}
                                    />
                                    <div className="basis-2/5 flex flex-col bg-black/40">
                                        <div
                                            className="w-full p-2 px-3 gap-2 bg-neutral-900/80 font-mono text-xs md:text-sm text-left text-neutral-400">
                                            <span className="">Trader actions</span>
                                        </div>
                                        <ActionButtons
                                            epoch={chainState.epoch}
                                            onBuy={() => onAgentAction("human", "BUY")}
                                            onSell={() => onAgentAction("human", "SELL")}
                                            onNoAction={() => onAgentAction("human", "HODL")}
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col bg-black/40 min-h-0">
                                    <span className="text-xl p-4 font-funnel-display font-bold">Transaction History</span>
                                        
                                        <div
                                            className="w-full p-2 px-3 gap-2 bg-neutral-900/80 font-mono text-xs md:text-sm text-left text-neutral-400">
                                            <div
                                                className="w-full py-1 grid grid-cols-8 gap-2 font-mono text-neutral-400 text-xs md:text-sm">
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
            </main>
        </div>
    )
}

export default TradingScreen
