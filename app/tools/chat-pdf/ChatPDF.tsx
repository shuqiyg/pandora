"use client"

import { useRef, useState } from "react"
import { AlertCircle, Bot, FileUp, Loader2 } from "lucide-react"
import { Document, Page, pdfjs } from "react-pdf"

import { PDFPage } from "@/lib/shared"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"

import { Chat } from "./Chat"

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.js",
    import.meta.url
).toString()

const maxFileSize = 20 * 1_000_000

const newChat = async (documents: PDFPage[]) => {
    try {
        const response = await fetch(`/tools/chat-pdf/api/new`, {
            method: "POST",
            body: JSON.stringify(documents),
        })

        if (response.ok) {
            return (await response.json()) as {
                success: boolean
                chatId: string | null
            }
        }

        return null
    } catch (e) {
        console.error(e)

        return null
    }
}

async function extractPageText(page) {
    const textContent = await page.getTextContent()

    let lastY,
        text = ""
    for (let item of textContent.items) {
        if (lastY == item.transform[5] || !lastY) {
            text += item.str
        } else {
            text += "\n" + item.str
        }

        lastY = item.transform[5]
    }

    return text
}

async function processDocument(document, onTextExtracted: () => void) {
    const pages: PDFPage[] = []
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
        const page = await document.getPage(pageNumber)
        const pageText = await extractPageText(page)

        pages.push({
            page: pageNumber,
            textContent: pageText,
        })
    }

    onTextExtracted()

    return await newChat(pages)
}

export function ChatPDF() {
    const { toast } = useToast()

    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState(0)

    const pdfRef = useRef<HTMLInputElement | null>(null)
    const [pdfFile, setPdfFile] = useState<File | null>(null)

    const [numPages, setNumPages] = useState(null)
    const [pageNumber, setPageNumber] = useState<number>(1)

    const [chatId, setChatId] = useState<string | null>(null)

    const [fileValidationError, setFileValidationError] = useState<
        string | null
    >(null)

    async function onDocumentLoadSuccess(document) {
        setProgress(0)
        setNumPages(document.numPages)
        const result = await processDocument(document, () => setProgress(20))
        setProgress(100)
        setLoading(false)
        if (result?.success && result.chatId) {
            setChatId(result.chatId)
            return
        }

        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "There was a problem with your request.",
        })
    }

    function onDocumentLoadError() {
        setLoading(false)
    }

    const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files?.length) {
            return
        }

        setFileValidationError(null)

        const [file] = Array.from(event.target.files)
        if (file && file.size > maxFileSize) {
            setFileValidationError(
                `The file size must not exceed ${
                    Math.round(maxFileSize) / 1_000_000
                } MB.`
            )
            return
        }

        if (file) {
            setChatId(null)
            setProgress(0)

            setPdfFile(file)
            setLoading(true)
        }
    }

    const hasNextPage = () => numPages != null && pageNumber < numPages
    const hasPreviousPage = () => pageNumber > 1

    const onPreviousPage = () => {
        if (pageNumber > 1) {
            setPageNumber(pageNumber - 1)
        }
    }
    const onNextPage = () => {
        if (numPages && pageNumber < numPages) {
            setPageNumber(pageNumber + 1)
        }
    }

    return (
        <>
            <div>
                <input
                    ref={pdfRef}
                    type="file"
                    name="pdf"
                    accept="application/pdf"
                    className="hidden"
                    onChange={uploadFile}
                />
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <Button
                        disabled={loading}
                        onClick={(e) => {
                            e.preventDefault()
                            pdfRef?.current?.click()
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Please wait
                            </>
                        ) : (
                            <>
                                <FileUp className="mr-2 h-4 w-4" /> Upload{" "}
                                {chatId ? "another" : "your"} PDF
                            </>
                        )}
                    </Button>
                    <div className="max-w-[400px] text-sm text-muted-foreground">
                        {
                            "Closing browser tab will terminate the chat. Otherwise chat with your PDF is available for the next 12 hours."
                        }
                    </div>
                </div>
                {fileValidationError && (
                    <Alert variant="destructive" className="mt-2 w-[300px]">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {fileValidationError}
                        </AlertDescription>
                    </Alert>
                )}
            </div>
            {pdfFile && (
                <div className={`mt-4 grid grid-cols-1 gap-10 md:grid-cols-2`}>
                    <div className="flex flex-col rounded-lg bg-muted p-4">
                        {numPages && numPages > 1 && (
                            <div className="flex flex-row items-center justify-center gap-2 pb-4">
                                <div>
                                    <Button
                                        variant="outline"
                                        onClick={onPreviousPage}
                                        disabled={!hasPreviousPage()}
                                    >
                                        ← Previous
                                    </Button>
                                </div>
                                <div>
                                    {pageNumber} / {numPages}
                                </div>
                                <div>
                                    <Button
                                        variant="outline"
                                        onClick={onNextPage}
                                        disabled={!hasNextPage()}
                                    >
                                        Next →
                                    </Button>
                                </div>
                            </div>
                        )}
                        <Document
                            file={pdfFile}
                            onLoadError={onDocumentLoadError}
                            onLoadSuccess={onDocumentLoadSuccess}
                            className="mx-auto"
                        >
                            <Page
                                pageNumber={pageNumber}
                                renderAnnotationLayer={false}
                                renderTextLayer={false}
                            />
                        </Document>
                    </div>
                    <div>
                        {!chatId && (
                            <div>
                                <span className="flex flex-row items-center">
                                    <Bot className="mr-2 h-4 w-4 animate-pulse " />
                                    The chat is being prepared...
                                </span>
                                <Progress
                                    value={progress}
                                    className="mt-2 w-[300px]"
                                />
                            </div>
                        )}
                        {chatId && (
                            <Chat
                                chatId={chatId}
                                showPages={numPages != null && numPages > 1}
                                onGoToPage={(newPage) => setPageNumber(newPage)}
                            />
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
