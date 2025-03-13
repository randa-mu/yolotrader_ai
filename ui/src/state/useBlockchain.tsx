import {Dispatch, useEffect, useReducer} from "react"
import {APP_CONFIG, WALLET} from "@/config"
import {ThresholdWallet, ThresholdWallet__factory} from "@/generated"
import {ChainAction, chainReducer, ChainState, initialChainState} from "@/state/chain-reducer"

export function useBlockchain(): [ChainState, Dispatch<ChainAction>] {
    const [state, dispatch] = useReducer(chainReducer, initialChainState)
    const treasuryContract = ThresholdWallet__factory.connect(APP_CONFIG.treasuryAddress, WALLET)
    const orderbookContract = ThresholdWallet__factory.connect(APP_CONFIG.orderbookAddress, WALLET)

    const onNewBlock = (blockNumber: bigint) => {
        dispatch({
            type: "new_epoch",
            epoch: blockNumber
        })
    }
    const addBlockListener = async () => {
        await WALLET.provider.on("block", onNewBlock)
    }

    const setupListeners = async () => {
        try {
            await fetchBlockNumber(dispatch)
            await addBlockListener()
            await updateBalance(dispatch, treasuryContract, orderbookContract)
            await treasuryContract.addListener("Transfer", () => updateBalance(dispatch, treasuryContract, orderbookContract))
            await orderbookContract.addListener("Transfer", () => updateBalance(dispatch, treasuryContract, orderbookContract))
        } catch (err) {
            console.error("error adding blockchain listener", err)
        }
    }

    const removeListeners = async () => {
        try {
            await WALLET.provider.off("block", onNewBlock)
            await treasuryContract.removeAllListeners("Transfer")
            await orderbookContract.removeAllListeners("Transfer")
        } catch (err) {
            console.error("error removing blockchain listener", err)
        }
    }

    useEffect(() => {
        setupListeners()
        return () => {
            removeListeners()
        }
    }, [])

    return [state, dispatch]
}

async function updateBalance(dispatch: Dispatch<ChainAction>, treasuryContract: ThresholdWallet, orderbookContract: ThresholdWallet) {
    dispatch({
        type: "balance_update",
        treasury: {
            balance: await WALLET.provider.getBalance(APP_CONFIG.treasuryAddress),
            nonce: await treasuryContract.nonce(),
        },
        orderbook: {
            balance: await WALLET.provider.getBalance(APP_CONFIG.orderbookAddress),
            nonce: await orderbookContract.nonce(),
        }
    })
}

async function fetchBlockNumber(dispatch: Dispatch<ChainAction>) {
    const blockNumber = await WALLET.provider.getBlockNumber()
    dispatch({
        type: "new_epoch",
        epoch: blockNumber
    })
}