import OpenAI from "openai"
import {PRICE_DATA} from "@/data/price"
import {NEWS_DATA} from "@/data/news"
import {POSITION_DATA} from "@/data/position"
import {TREASURY_POLICY} from "@/data/treasury-policy"
import {Decision} from "@/reducer/app-reducer"

// Define types for our data structures
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

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    // PROBABLY DON'T DO THIS IN REAL LIFE
    dangerouslyAllowBrowser: true
})

const ASSISTANT_ID = import.meta.env.VITE_OPENAI_ASSISTANT_ID


// Risk Analysis
export async function runRiskAnalysis(epoch: number): Promise<RiskAnalysisResponse> {
    const priceHistory = PRICE_DATA
    const newsHistory = NEWS_DATA
    const positionData = POSITION_DATA

    const filteredPriceData = priceHistory.price_data.filter((item: PriceVolumeDataPoint) => item.epoch <= epoch)
    const filteredVolumeData = priceHistory.volume_data.filter((item: PriceVolumeDataPoint) => item.epoch <= epoch)
    const filteredNewsData = newsHistory.filter((item: NewsItem) => item.epoch <= epoch)

    const filteredPriceHistory = {
        token: priceHistory.token,
        price_data: filteredPriceData,
        volume_data: filteredVolumeData
    }

    // Create a thread
    const thread = await openai.beta.threads.create()
    await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: "Please perform a risk analysis based on the current market data.",
    })

    // Run the assistant with the function
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

    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id)
    while (runStatus.status !== "requires_action" && runStatus.status !== "completed") {
        await new Promise(resolve => setTimeout(resolve, 1000))
        runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id)
    }

    if (runStatus.status === "requires_action" && runStatus.required_action?.submit_tool_outputs) {
        const toolCalls = runStatus.required_action.submit_tool_outputs.tool_calls

        if (toolCalls) {
            const toolOutputs = []

            for (const toolCall of toolCalls) {
                if (toolCall.function.name === "get_market_data") {

                    toolOutputs.push({
                        tool_call_id: toolCall.id,
                        output: JSON.stringify({
                            treasury_balance: positionData.treasury_balance,
                            position: positionData.current_position,
                            order_size: positionData.order_size,
                            price_history: JSON.stringify(filteredPriceHistory),
                            news_history: JSON.stringify(filteredNewsData),
                            treasury_policy: TREASURY_POLICY
                        })
                    })
                }
            }

            // Submit the tool outputs
            await openai.beta.threads.runs.submitToolOutputs(thread.id, run.id, {
                tool_outputs: toolOutputs,
            })

            // Poll for completion after submitting tool outputs
            runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id)
            while (runStatus.status !== "completed") {
                await new Promise(resolve => setTimeout(resolve, 1000))
                runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id)
            }
        }
    }

    const messages = await openai.beta.threads.messages.list(thread.id)
    const assistantMessages = messages.data.filter(msg => msg.role === "assistant")
    const latestMessage = assistantMessages[assistantMessages.length - 1]
    const responseText = latestMessage?.content[0]?.type === "text" ? latestMessage.content[0].text.value : ""

    return JSON.parse(responseText)
}