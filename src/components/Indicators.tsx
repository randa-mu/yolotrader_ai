import * as React from "react"
import {Decision} from "@/reducer/app-reducer"

export type IconProps = { value: Decision }

export function IndicatorIcon(props: IconProps) {
    switch (props.value) {
        case "BUY":
            return <p>✅</p>
        case "SELL":
            return <p>❌</p>
        default:
            return <p>🤝</p>
    }
}
