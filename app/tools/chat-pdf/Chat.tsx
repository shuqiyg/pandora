"use client"

import { useEffect, useRef, useState } from "react"
import { Bot, FileQuestion, Loader2 } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

interface ChatProps {
    chatId: string
    onGoToPage: (number) => void
    showPages: boolean
}

interface ChatInteraction {
    isBot: boolean
    message: string
    pages?: number[]
}

async function askQuestion(chatId: string, question: string) {
    try {
        const response = await fetch(`/tools/chat-pdf/api/ask`, {
            method: "POST",
            body: JSON.stringify({
                chatId,
                question,
            }),
        })

        if (response.ok) {
            return (await response.json()) as {
                success: boolean
                result?: { text: string; pages: number[] }
            }
        }

        return null
    } catch (e) {
        console.error(e)

        return null
    }
}

export function Chat({ chatId, showPages, onGoToPage}: ChatProps) {
    const { toast } = useToast()
    const [processing, setProcessing] = useState(false)
    const [chatInteractions, setChatInteractions] = useState<ChatInteraction[]>(
        [
            {
                message:
                    "The PDF is processed. You can ask any questions related to it.",
                isBot: true,
            },
        ]
    )
    const [question, setQuestion] = useState<string>("")

    const onAskQuestion = async () => {
        if (question.length == 0) {
            return
        }

        setChatInteractions((previousInteractions) => [
            ...previousInteractions,
            { isBot: false, message: question },
        ])

        setProcessing(true)
        const result = await askQuestion(chatId, question)
        setProcessing(false)

        if (result?.success && result.result) {
            const answer = result.result.text
            const pages = result.result.pages
            setChatInteractions((previousInteractions) => [
                ...previousInteractions,
                { isBot: true, message: answer, pages: pages },
            ])
            setQuestion("")

            return
        }

        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "There was a problem with your request.",
        })
    }

    const interactionsRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (interactionsRef?.current?.lastElementChild) {
            interactionsRef.current.lastElementChild.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "start",
            })
        }
    }, [chatInteractions])

    return (
        <div className="w-full rounded-lg">
            <div
                ref={interactionsRef}
                className="flex h-[450px] flex-col gap-2 overflow-scroll rounded-lg bg-secondary p-2"
            >
                {chatInteractions.map((i, index) => (
                    <Alert key={index}>
                        {i.isBot ? (
                            <Bot className="h-4 w-4" />
                        ) : (
                            <FileQuestion className="h-4 w-4" />
                        )}
                        <AlertDescription>
                            <div>
                                {i.message}        
                            </div>
                            {showPages && i.pages && i.pages.length > 0 && <div className="mt-2 flex flex-row gap-2">
                                {i.pages.map(p=> 
                                    <Button key={p} variant="outline" size="sm" onClick={() => onGoToPage(p)}>{p}</Button>
                                )}
                            </div>}                        
                        </AlertDescription>
                    </Alert>
                ))}

                {processing && (
                    <Alert key="processing" className="animate-pulse">
                        <Bot className="h-4 w-4" />
                        <AlertDescription>...</AlertDescription>
                    </Alert>
                )}
            </div>
            <form
                className="mt-2 flex flex-row gap-2"
                onSubmit={async (e) => {
                    e.preventDefault()
                    await onAskQuestion()
                }}
            >
                <Input
                    disabled={processing}
                    type="text"
                    placeholder="Ask any question"
                    onChange={(e) => setQuestion(e.target.value)}
                    value={question}
                />
                <Button
                    type="submit"
                    disabled={processing}
                    className="min-w-[80px]"
                >
                    {processing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        "Ask"
                    )}
                </Button>
            </form>
        </div>
    )
}
