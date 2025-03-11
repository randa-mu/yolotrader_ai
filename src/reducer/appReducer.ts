type AppAction = RestartAction | NewEpochAction | AgentDecisionAction

type RestartAction = { type: "restart" }

type NewEpochAction = { type: "new_epoch" }

export type AgentDecisionAction = { type: "agent_action", agent: Agent, decision: Decision }
export type Agent = "human" | "risk" | "liquidity"
export type Decision = "BUY" | "SELL" | "NO ACTION"

export function createAgentDecision(agent: Agent, decision: Decision): AgentDecisionAction {
    return {type: "agent_action", agent, decision}
}

export type AppState = {
    epoch: number
    balances: {
        company: number,
        orderBook: number
    }
    current: Map<string, Decision>
    history: Array<Map<string, Decision>>
}


const initialCurrent: [string, Decision][] = Object.entries({
    human: "NO ACTION", risk: "NO ACTION", liquidity: "NO ACTION"
})
export const initialDecisionState = {
    epoch: 0,
    current: new Map(initialCurrent),
    balances: {
        company: 10_000,
        orderBook: 0,
    },
    history: []
}

export const appReducer = (state: AppState, action: AppAction) => {
    switch (action.type) {
        case "restart":
            return initialDecisionState

        case "agent_action":
            return {...state, current: state.current.set(action.agent, action.decision)}

        case "new_epoch":
            const balances = calculateNextBalances(state.current, state.balances)
            return {
                epoch: state.epoch + 1,
                history: [...state.history, state.current],
                current: new Map<string, Decision>(initialCurrent),
                balances,
            }
    }
}

type Balances = {
    company: number,
    orderBook: number
}

function calculateNextBalances(decisions: Map<string, Decision>, currentBalances: Balances): Balances {
    let buys = 0
    let sells = 0
    let none = 0

    decisions.forEach((decision: Decision) => {
        switch (decision) {
            case "BUY":
                buys++
                break;
            case "SELL":
                sells++
                break;
            default:
                none++
        }
    })

    if (buys >= 2) {
        return {company: currentBalances.company - 1000, orderBook: currentBalances.orderBook + 1000}
    }
    if (sells >= 2) {
        return {company: currentBalances.company + 1000, orderBook: currentBalances.orderBook - 1000}
    }

    return currentBalances
}