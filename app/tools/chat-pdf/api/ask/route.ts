import { NextRequest, NextResponse } from "next/server"

import { askQuestion } from "@/lib/chat-pdf"
import { PDFChatQuestion } from "@/lib/shared"

export async function POST(request: NextRequest) {
    try {
        const chatQuestion = (await request.json()) as PDFChatQuestion
        const result = await askQuestion(chatQuestion.chatId, chatQuestion.question);

        return NextResponse.json({
            success: true,
            result
        })
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { success: false, message: "Internal application error" },
            { status: 500 }
        )
    }
}
