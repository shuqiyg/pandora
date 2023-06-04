import { randomBytes } from "crypto"
import * as fs from "fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import * as path from "path"
import { VectorDBQAChain } from "langchain/chains"
import { ChatOpenAI } from "langchain/chat_models/openai"
import { Document } from "langchain/document"
import { OpenAIEmbeddings } from "langchain/embeddings/openai"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { HNSWLib } from "langchain/vectorstores/hnswlib"

import { PDFPage } from "./shared"

const embeddingModel = new OpenAIEmbeddings({
    maxConcurrency: 5,
    openAIApiKey: process.env.OPENAI_API_KEY,
})
const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 4000,
    chunkOverlap: 20,
})

const model = new ChatOpenAI({
    temperature: 0.9,
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-3.5-turbo",
})

const createStoreDir = async (chatId: string) => {
    const path = storePath(chatId)
    await fs.mkdir(path, { recursive: true })

    return path
}

const storePath = (chatId: string) => {
    console.log(path.join(tmpdir(), "pandora", "chat-pdf", chatId))
    return path.join(tmpdir(), "pandora", "chat-pdf", chatId)
}

function getHoursDiff(a: Date, b: Date): number {
    const diffInMilliseconds = a.getTime() - b.getTime()
    const diffInHours = diffInMilliseconds / (1000 * 60 * 60)

    return diffInHours
}

export async function removeOutdatedChats() {
    const ttlHours = 12
    const now = new Date()

    const storageDir = join(tmpdir(), "pandora", "chat-pdf")
    const files = await fs.readdir(storageDir, { withFileTypes: true })

    for (const file of files) {
        if (file.isDirectory()) {
            const fullPath = path.join(storageDir, file.name)
            const stats = await fs.stat(fullPath)

            if (getHoursDiff(now, stats.birthtime) > ttlHours) {
                await fs.rm(fullPath, { recursive: true, force: true })
            }
        }
    }
}

export async function createChat(pages: PDFPage[]) {
    const documents = pages.map(
        (p) =>
            new Document({
                pageContent: p.textContent,
                metadata: {
                    page: p.page,
                },
            })
    )

    const chunkedDocuments = await textSplitter.splitDocuments(documents)
    const vectorStore = await HNSWLib.fromDocuments(
        chunkedDocuments,
        embeddingModel
    )

    const chatId = randomBytes(32).toString("hex")
    const path = await createStoreDir(chatId)

    await vectorStore.save(path)

    return chatId
}

export async function askQuestion(chatId: string, question: string) {
    const vectorStore = await HNSWLib.load(storePath(chatId), embeddingModel)

    const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
        k: 5,
        returnSourceDocuments: true,
    })
    const { text: responseText, sourceDocuments } = (await chain.call({
        query: question,
    })) as { text: string; sourceDocuments?: Document[] }

    const pages = (
        (sourceDocuments
            ? sourceDocuments.map((d) => d.metadata.page).sort((a, b) => a - b)
            : []) as number[]
    ).filter((value, index, self) => {
        return self.indexOf(value) === index
    })

    return {
        text: responseText,
        pages,
    }
}
