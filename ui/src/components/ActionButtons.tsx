import * as React from "react"
import {useEffect, useState} from "react"
import {Button} from "@/components/ui/button"
import {APP_CONFIG} from "@/config"

type ActionButtonsProps = {
    epoch: bigint
    onSell: () => any
    onNoAction: () => any
    onBuy: () => any
}

const COUNTDOWN_MS = 100
export const ActionButtons = (props: ActionButtonsProps) => {
       const [countdownMs, setCountdownMs] = useState(APP_CONFIG.msPerEpoch)

        useEffect(() => {
            setCountdownMs(APP_CONFIG.msPerEpoch)
            const intervalId = setInterval(
                () => setCountdownMs((c) => c - COUNTDOWN_MS),
                COUNTDOWN_MS
            )
            return () => clearInterval(intervalId)
        }, [props.epoch])

    const [choiceMade, setChoiceMade] = useState(false)

    useEffect(() => {
        setChoiceMade(false)
    }, [props.epoch])

    const choiceMadeMixin = (fn: () => any) => {
        return () => {
            fn()
            setChoiceMade(true)
        }
    }

    const formatCountdown = (ms) => {
        const totalSeconds = Math.max(0, Math.floor(ms / 1000));
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = Math.floor((ms % 1000) / 10);

        const paddedMinutes = minutes.toString().padStart(2, '0');
        const paddedSeconds = seconds.toString().padStart(2, '0');
        const paddedMilliseconds = milliseconds.toString().padStart(2, '0');

        // Return formatted time string
        return `${paddedMinutes}:${paddedSeconds}:${paddedMilliseconds}`;
    };

    return (
        <div className="w-full pb-4">
            <div className="w-full flex flex-row gap-4 justify-center p-4">
                <Button
                    className="grow rounded-none bg-red-500 border-radius-0 text-black font-mono font-semibold"
                    onClick={choiceMadeMixin(props.onSell)}
                    disabled={choiceMade}
                >
                    SELL {APP_CONFIG.orderSize}
                </Button>
                <Button
                    className="grow rounded-none bg-yellow-500 border-radius-0 text-black font-mono font-semibold"
                    onClick={choiceMadeMixin(props.onNoAction)}
                    disabled={choiceMade}
                >
                    HODL {APP_CONFIG.orderSize}
                </Button>
                <Button
                    className="grow rounded-none bg-green-500 border-radius-0 text-black font-mono font-semibold"
                    onClick={choiceMadeMixin(props.onBuy)}
                    disabled={choiceMade}
                >
                    BUY {APP_CONFIG.orderSize}
                </Button>
            </div>
            <div>
                <p className="text-xl text-white font-mono font-light">TIME TO NEXT EPOCH: {formatCountdown(countdownMs)}</p>
            </div>
            <div className="h-6">
                {choiceMade && <p className="text-base text-white font-mono font-light">Wait for the next epoch of market data to trade again.</p>}
            </div>
        </div>
    )
}