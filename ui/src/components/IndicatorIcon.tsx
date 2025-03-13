import * as React from "react"
import {Decision} from "@/state/app-reducer"

export type IconProps = {
    size?: "small" | "large"
    value: Decision
}

export function IndicatorIcon(props: IconProps) {
    const className = props.size === "large" ? "text-4xl" : ""
    switch (props.value) {
        case "BUY":
            return <p className={className}>✅</p>
        case "SELL":
            return <p className={className}>❌</p>
        default:
            return <p className={className}>🤝</p>
    }
}
