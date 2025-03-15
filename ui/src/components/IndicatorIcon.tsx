import * as React from "react"
import {Decision} from "@/state/app-reducer"

export type IconProps = {
    size?: "small" | "large"
    value: Decision
}

export function IndicatorIcon(props: IconProps) {
    const className = props.size === "large" ? "text-2xl font-mono text-center align-middle" : "text-lg font-mono text-center align-middle"
    switch (props.value) {
        case "BUY":
            return <p className={`${className} + text-green-500`}>⏶</p>
        case "SELL":
            return <p className={`${className} + text-red-500`}>⏷</p>
        case "NO ACTION":
             return <p className={`${className} + text-neutral-500`}>—</p>
        default:
            return <p className={`${className} + text-yellow-500`}>⊖</p>
    }
}
