import { Metadata } from "next"

import { PageHeader } from "@/components/page-header"

import { ChatPDF } from "./ChatPDF"

export const metadata: Metadata = {
    title: "Chat with your PDFs",
    description: "Upload your PDF file and have AI to find your answers.",
}

export default function ChatWithAnyPDF() {
    return (
        <>
            <PageHeader
                heading="Chat with your PDFs"
                subheading="Upload your PDF file and have AI to find your answers."
            />
            <ChatPDF />
        </>
    )
}