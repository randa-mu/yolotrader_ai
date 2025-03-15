import * as React from "react"
import {useEffect, useState} from "react"

type EpochCounterProps = {
    epoch: bigint
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
            <h1 className="font-mono text-2xl font-semibold text-red-500">EPOCH {props.epoch}</h1>
        </div>
    )
}