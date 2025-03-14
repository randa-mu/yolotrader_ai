import {ChainState} from "@/state/chain-reducer"
import {AppState} from "@/state/app-reducer"
import {ORDERBOOK_ADDRESS, sendTransfer, TREASURY_ADDRESS} from "@/lib/signing"

// returns transaction hash or empty
export async function tradeIfNecessary(chainState: ChainState, appState: AppState): Promise<string> {
    const values = appState.current.values().toArray()
    if (values.filter(it => it === "BUY").length >= 2) {
        return sendTransfer(TREASURY_ADDRESS, ORDERBOOK_ADDRESS, chainState.treasury.nonce)

    }
    if (values.filter(it => it === "SELL").length >= 2) {
        return sendTransfer(ORDERBOOK_ADDRESS, TREASURY_ADDRESS, chainState.orderbook.nonce)
    }

    return ""
}