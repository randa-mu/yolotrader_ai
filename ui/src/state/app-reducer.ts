import {Dispatch} from "react"

export type AppAction = RestartAction | NewEpochAction | AgentDecisionAction

type RestartAction = { type: "restart" }

type NewEpochAction = { type: "on_new_epoch", epoch: bigint }
export const createNewEpochAction = (dispatch: Dispatch<AppAction>) => (epoch: bigint) => {
    dispatch({type: "on_new_epoch", epoch: BigInt(epoch ?? 0)})
}

export type AgentDecisionAction = { type: "agent_action", agent: Agent, decision: Decision }
export type Agent = "human" | "risk" | "liquidity"
export type Decision = "BUY" | "SELL" | "HODL" | "NO ACTION"

export const createAgentDecision = (dispatch: Dispatch<AppAction>) => (agent: Agent, decision: Decision)  => {
    dispatch({type: "agent_action", agent, decision})
}

export type AppState = {
    epoch: bigint
    current: Map<string, Decision>
    history: Array<HistoryEntry>
}
export type HistoryEntry = {
    epoch: bigint
    decisions: Map<string, Decision>
}

const initialCurrent: [string, Decision][] = Object.entries({
    human: "NO ACTION", risk: "HODL", liquidity: "HODL"
})

export const initialDecisionState = {
    epoch: 0n,
    current: new Map(initialCurrent),
    history: []
}

export const appReducer = (state: AppState, action: AppAction) => {
    switch (action.type) {
        case "restart":
            return initialDecisionState

        case "agent_action":
            return {...state, current: state.current.set(action.agent, action.decision)}

        case "on_new_epoch":
            if (state.epoch === 0n) {
                return {
                    epoch: action.epoch,
                    current: new Map<string, Decision>(initialCurrent),
                    history: [],
                }
            }
            return {
                epoch: action.epoch,
                history: [...state.history, {
                    epoch: action.epoch - 1n,
                    decisions: state.current
                }],
                current: new Map<string, Decision>(initialCurrent),
            }

        default:
            return state
    }
}
