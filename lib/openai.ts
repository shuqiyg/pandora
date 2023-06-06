import { Configuration, OpenAIApi } from "openai"

const configuration = new Configuration({
    organization: process.env.OPENAI_ORGANIZATION_ID,
    apiKey: process.env.OPENAI_API_KEY,
})

export const openAIApi = new OpenAIApi(configuration)

export const askOpenAIApi = async (prompt: string, systemMessage?: string) => {
    const systemMessages: { role: "system"; content: string }[] =
        systemMessage && systemMessage.length > 0
            ? [{ role: "system", content: systemMessage }]
            : []
    const response = await openAIApi.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [...systemMessages, { role: "user", content: prompt }],
    })

    for (const choice of response.data.choices) {
        if (
            choice.message?.content &&
            choice.message.content.length > 0 &&
            choice.finish_reason == "stop"
        ) {
            return choice?.message.content
        }
    }

    return null
}
