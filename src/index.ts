import { OpenAI } from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
dotenv.config();

// Define types for our data structures
interface PriceVolumeDataPoint {
    epoch: number;
    price?: number;
    volume?: number;
}

interface NewsItem {
    epoch: number;
    source: string;
    content: string;
}

//unused but maybe handy down the line
interface CurrentPosition {
    treasury_balance: number,
    current_position: number,
    order_size: number
  }

//setup OpenAI stuffs
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ASSISTANT_ID = 'asst_OnUa2nyrOavFkt1ZYN6KqH5P';


// Risk Analysis
async function runRiskAnalysis() {
  try {
    // Load data from local files
    const priceHistory = JSON.parse(fs.readFileSync(path.join(__dirname, 'Data', 'price.json'), 'utf8'));
    const newsHistory = JSON.parse(fs.readFileSync(path.join(__dirname, 'Data', 'news.json'), 'utf8'));
    
    // TODO: we will need to update this with a call to live position and balance data
    const positionData = JSON.parse(fs.readFileSync(path.join(__dirname, 'Data', 'position.json'), 'utf8'));

    const treasuryPolicy = fs.readFileSync(path.join(__dirname, 'Data', 'treasury_policy.md'), 'utf8');

    // Define current epoch
    const epoch = Math.floor(Math.random() * 10) + 1;
    // const epoch = 7;
    console.log(`Current epoch: ${epoch}`);

    // Filter price and volume data up to the selected epoch
    const filteredPriceData = priceHistory.price_data.filter((item: PriceVolumeDataPoint) => item.epoch <= epoch);
    const filteredVolumeData = priceHistory.volume_data.filter((item: PriceVolumeDataPoint) => item.epoch <= epoch);

    // Filter news data up to the selected epoch
    const filteredNewsData = newsHistory.filter((item: NewsItem) => item.epoch <= epoch);

    // Create filtered price history object
    const filteredPriceHistory = {
        token: priceHistory.token,
        price_data: filteredPriceData,
        volume_data: filteredVolumeData
    };

    // Create a thread
    const thread = await openai.beta.threads.create();
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: 'Please perform a risk analysis based on the current market data.',
    });

    // Run the assistant with the function
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID,
      tools: [
        {
          type: 'function',
          function: {
            name: 'get_market_data',
          }
        }
      ]
    });

    // Poll for the run to complete
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

    while (runStatus.status !== 'requires_action' && runStatus.status !== 'completed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    // Function call
    if (runStatus.status === 'requires_action' && runStatus.required_action?.submit_tool_outputs) {
      const toolCalls = runStatus.required_action.submit_tool_outputs.tool_calls;

      if (toolCalls) {
        const toolOutputs = [];

        for (const toolCall of toolCalls) {
          if (toolCall.function.name === 'get_market_data') {

            toolOutputs.push({
                tool_call_id: toolCall.id,
                output: JSON.stringify({
                treasury_balance: positionData.treasury_balance,
                position: positionData.current_position,
                order_size: positionData.order_size,
                price_history: JSON.stringify(filteredPriceHistory),
                news_history: JSON.stringify(filteredNewsData),
                treasury_policy: treasuryPolicy
              })
            });
          }
        }

        // Submit the tool outputs
        await openai.beta.threads.runs.submitToolOutputs(thread.id, run.id, {
          tool_outputs: toolOutputs,
        });

        // Poll for completion after submitting tool outputs
        runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        while (runStatus.status !== 'completed') {
          await new Promise(resolve => setTimeout(resolve, 1000));
          runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        }
      }
    }

    // Get assistant's response
    const messages = await openai.beta.threads.messages.list(thread.id);

    const assistantMessages = messages.data.filter(msg => msg.role === 'assistant');
    const latestMessage = assistantMessages[assistantMessages.length - 1];

    // Parse
    const responseText = latestMessage?.content[0]?.type === 'text' ? latestMessage.content[0].text.value : '';

    try {
      const riskAnalysis = JSON.parse(responseText);
      console.log(`Action Recommendation: ${riskAnalysis.action_recomendation}`);
      console.log(`Policy Categories: ${riskAnalysis.policy_categories.join(', ')}`);
      console.log(`Decision Reason: ${riskAnalysis.decision_reason}`);
    } catch (e) {
      console.log('Could not parse response as JSON. Raw response:');
      console.log(responseText);
    }

  } catch (error) {
    console.error('Error running risk analysis:', error);
  }
}

// Run
runRiskAnalysis();