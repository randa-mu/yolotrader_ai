import * as React from "react"
import {useEffect, useState} from "react"

type EpochCounterProps = {
    epoch: number
    msPerEpoch: number
}

const COUNTDOWN_MS = 100
export const EpochCounter = (props: EpochCounterProps) => {
    const [countdownMs, setCountdownMs] = useState(props.msPerEpoch)

    useEffect(() => {
        setCountdownMs(props.msPerEpoch)
        const intervalId = setInterval(
            () => setCountdownMs((c) => c - COUNTDOWN_MS),
            COUNTDOWN_MS
        )
        return () => clearInterval(intervalId)
    }, [props.epoch, props.msPerEpoch])

    return (
        <div>
            <h1 className="text-3xl font-extrabold">Epoch: {props.epoch}</h1>
            <p>{countdownMs / 1000}s remaining</p>
        </div>
    )
}