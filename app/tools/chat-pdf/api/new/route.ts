import { NextRequest, NextResponse } from "next/server"

import { createChat } from "@/lib/chat-pdf"
import { PDFPage } from "@/lib/shared"

export async function POST(request: NextRequest) {
    try {
        const pages = (await request.json()) as PDFPage[]
        if (pages.length == 0) {
            return NextResponse.json({
                success: false,
                message: "At least one PDF page required",
            })
        }

        const chatId = await createChat(pages)

        return NextResponse.json({
            success: true,
            chatId: chatId,
        })
    } catch (error) {
        console.log(error)

        return NextResponse.json(
            { success: false, message: "Internal application error" },
            { status: 500 }
        )
    }
}
