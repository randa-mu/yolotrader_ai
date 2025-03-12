# yolotrader-ai

Manage your treasury while ensuring your junior employees can't break the bank!

## Quickstart
- go to https://platform.openai.com/account/limits and add some balance to your openAPI account (note: this is separate from a chatGPT subscription!)
- go to https://platform.openai.com/assistants and create an assistant
  - use the [system instructions](./src/data/system_instructions.md)
  - add a new function using the contents of [get_market_data.json](./src/data/get_market_data.json) 
  - add a new response format of type json schema using the contents of [risk_analysis_response.json](./src/data/risk_analysis_response.json)
  - store the string under the assistant name (it starts with `asst_`)
- go to https://platform.openai.com/api-keys and create an API key
- copy the `.env.sample` file into a new file called simply `.env` and fill in the required fields from your openAPI account
- run `npm install`
- run `npm run dev`
- open the web browser to http://localhost:5173 (or a different port if your shell says so)
