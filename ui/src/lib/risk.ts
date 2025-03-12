import OpenAI from "openai"
import {Run, Thread} from "openai/resources/beta/threads"
import {PRICE_DATA} from "@/data/price"
import {NEWS_DATA} from "@/data/news"
import {AppState, Decision} from "@/reducer/app-reducer"
import {APP_CONFIG} from "@/config"

interface PriceVolumeDataPoint {
    epoch: number
    price?: number
    volume?: number
}

interface NewsItem {
    epoch: number
    source: string
    content: string
}

type RiskAnalysisResponse = {
    action_recomendation: Decision
    policy_categories: Array<string>
    decision_reason: string
}

type RiskAnalysis = {
    decision: Decision,
    categories: Array<string>,
    reason: string
}

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    // PROBABLY DON'T DO THIS IN REAL LIFE
    dangerouslyAllowBrowser: true
})

const ASSISTANT_ID = import.meta.env.VITE_OPENAI_ASSISTANT_ID

export async function runRiskAnalysis(state: AppState, treasuryPolicy: string): Promise<RiskAnalysis> {
    const thread = await openai.beta.threads.create()
    await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: "Please perform a risk analysis based on the current market data.",
    })

    const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: ASSISTANT_ID,
        tools: [
            {
                type: "function",
                function: {
                    name: "get_market_data",
                }
            }
        ]
    })

    await waitForRun(thread, run.id, state, treasuryPolicy)

    const json = await extractLatestResponse(thread)
    if (json === "") {
        throw new Error("risk analysis indeterminate")
    }
    const response: RiskAnalysisResponse = JSON.parse(json)
    return {
        decision: response.action_recomendation,
        categories: response.policy_categories,
        reason: response.decision_reason

    }
}

async function waitForRun(thread: Thread, runId: string, state: AppState, treasuryPolicy: string): Promise<void> {
    let runs = 0
    while (runs < APP_CONFIG.inferenceRetries) {
        const run = await openai.beta.threads.runs.retrieve(thread.id, runId)
        if (run.status === "completed") {
            return
        }
        if (run.status === "failed" || run.status === "cancelled") {
            const msg = `error running risk analysis for epoch ${state.epoch}`
            console.error(msg, run.last_error)
            throw new Error(msg)
        }

        if (run.status === "requires_action" && run.required_action?.submit_tool_outputs) {
            await submitToolOutput(thread, run, state, treasuryPolicy)
        }

        runs++
        await new Promise(resolve => setTimeout(resolve, 1000))
    }

    throw new Error(`failed to infer risk after ${APP_CONFIG.inferenceRetries} tries for epoch ${state.epoch}`)
}

async function submitToolOutput(thread: Thread, run: Run, state: AppState, treasuryPolicy: string): Promise<void> {
    const {epoch, balances} = state
    const {treasury, orderBook} = balances
    const toolCalls = run.required_action.submit_tool_outputs.tool_calls

    if (!toolCalls) {
        throw new Error(`missing \`tool_calls\` for submitting tool output for epoch ${epoch}`)
    }

    const priceHistory = PRICE_DATA
    const newsHistory = NEWS_DATA

    const filteredPriceData = priceHistory.price_data.filter((item: PriceVolumeDataPoint) => item.epoch <= epoch)
    const filteredVolumeData = priceHistory.volume_data.filter((item: PriceVolumeDataPoint) => item.epoch <= epoch)
    const filteredNewsData = newsHistory.filter((item: NewsItem) => item.epoch <= epoch)

    const filteredPriceHistory = {
        token: APP_CONFIG.token,
        price_data: filteredPriceData,
        volume_data: filteredVolumeData
    }

    const toolOutputs = []
    for (const toolCall of toolCalls) {
        if (toolCall.function.name === "get_market_data") {
            toolOutputs.push({
                tool_call_id: toolCall.id,
                output: JSON.stringify({
                    treasury_balance: treasury,
                    position: orderBook,
                    order_size: APP_CONFIG.orderSize,
                    price_history: JSON.stringify(filteredPriceHistory),
                    news_history: JSON.stringify(filteredNewsData),
                    treasury_policy: treasuryPolicy,
                })
            })
        }
    }

    await openai.beta.threads.runs.submitToolOutputs(thread.id, run.id, {
        tool_outputs: toolOutputs,
    })
}

async function extractLatestResponse(thread: Thread): Promise<string> {
    const messages = await openai.beta.threads.messages.list(thread.id)
    const assistantMessages = messages.data.filter(msg => msg.role === "assistant")
    const latestMessage = assistantMessages[assistantMessages.length - 1]

    if (latestMessage?.content[0]?.type === "text") {
        return latestMessage.content[0].text.value
    }
    return ""
}