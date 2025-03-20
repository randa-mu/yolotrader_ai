import {Dispatch} from "react"

export type ChainState = {
    epoch: bigint
    treasury: ThresholdWallet
    orderbook: ThresholdWallet
}
type ThresholdWallet = {
    balance: bigint,
    nonce: bigint
}

export type ChainAction = BalanceUpdate | NewEpoch
export type NewEpoch = {
    type: "new_epoch",
    epoch: bigint
}

export const createNewEpochAction = (dispatch: Dispatch<ChainAction>) => (epoch: bigint) =>
    dispatch({type: "new_epoch", epoch})

export type BalanceUpdate = {
    type: "balance_update",
    treasury: ThresholdWallet,
    orderbook: ThresholdWallet
}
export const createBalanceUpdateAction = (dispatch: Dispatch<ChainAction>) =>
    (treasury: ThresholdWallet, orderbook: ThresholdWallet) => dispatch({type: "balance_update", treasury, orderbook})

export const initialChainState = {
    epoch: 0n,
    treasury: {
        balance: 0n,
        nonce: 0n,
    },
    orderbook: {
        balance: 0n,
        nonce: 0n
    },
}

export function chainReducer(state: ChainState, action: ChainAction): ChainState {
    switch (action.type) {
        case "balance_update":
            return {...state, treasury: {...action.treasury}, orderbook: {...action.orderbook}}
        case "new_epoch":
            return {...state, epoch: action.epoch}
        default:
            return state
    }
}
