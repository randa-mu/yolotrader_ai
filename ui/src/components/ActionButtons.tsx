import * as React from "react"
import {useEffect, useState} from "react"
import {Button} from "@/components/ui/button"
import {APP_CONFIG} from "@/config"

type ActionButtonsProps = {
    epoch: number
    onSell: () => any
    onNoAction: () => any
    onBuy: () => any
}
export const ActionButtons = (props: ActionButtonsProps) => {
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
    return (
        <div>
            <div className="flex flex-row gap-2 justify-center">
                <Button
                    onClick={choiceMadeMixin(props.onSell)}
                    disabled={choiceMade}
                >
                    ❌ Sell {APP_CONFIG.orderSize}
                </Button>
                <Button
                    onClick={choiceMadeMixin(props.onNoAction)}
                    disabled={choiceMade}
                >
                    🤝 HODL
                </Button>
                <Button
                    onClick={choiceMadeMixin(props.onBuy)}
                    disabled={choiceMade}
                >
                    ✅ Buy {APP_CONFIG.orderSize}
                </Button>
            </div>
            <div>
                {choiceMade && <p>Wait for the next epoch of market data to trade again...</p>}
            </div>
        </div>
    )
}