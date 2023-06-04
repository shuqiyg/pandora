type PageProps = {
    heading: string
    subheading: string | React.ReactNode
}

export function PageHeader({ heading, subheading }: PageProps){
    return (
        <div className="flex max-w-[980px] flex-col items-start gap-2">
            <h1 className="text-3xl text-emerald-500 font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl">
            {heading} <br className="hidden sm:inline" />
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
            {subheading}
            </p>
        </div>
    )
}