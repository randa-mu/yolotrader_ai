type AppAction = RestartAction | NewEpochAction | AgentDecisionAction

type RestartAction = { type: "restart" }

type NewEpochAction = { type: "new_epoch" }

export type AgentDecisionAction = { type: "agent_action", agent: Agent, decision: Decision }
export type Agent = "human" | "risk" | "liquidity"
export type Decision = "BUY" | "SELL" | "HODL"

export function createAgentDecision(agent: Agent, decision: Decision): AgentDecisionAction {
    return {type: "agent_action", agent, decision}
}

export type AppState = {
    current: Map<string, Decision>
    history: Array<Map<string, Decision>>
}

const initialCurrent: [string, Decision][] = Object.entries({
    human: "HODL", risk: "HODL", liquidity: "HODL"
})
export const initialDecisionState = {
    current: new Map(initialCurrent),
    history: []
}

export const appReducer = (state: AppState, action: AppAction) => {
    switch (action.type) {
        case "restart":
            return initialDecisionState

        case "agent_action":
            return {...state, current: state.current.set(action.agent, action.decision)}

        case "new_epoch":
            return {
                history: [...state.history, state.current],
                current: new Map<string, Decision>(initialCurrent),
            }
    }
}
