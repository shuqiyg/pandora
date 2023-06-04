import Link from "next/link"

import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { Icons } from "@/components/icons"

export default function IndexPage() {
  const tools = [
    {
        name: "Chat with your PDFs",
        description:
            "Upload your PDF file and have AI to find your answers.",
        icon: <Icons.chat />,
        link: "/tools/chat-pdf",
    },
    // {
    //     name: "Privacy Policy",
    //     description:
    //         "Generate privacy policy to your preferences.",
    //     icon: <Icons.privacyPolicy />,
    //     link: "/tools/privacy-policy-generator",
    // },
    // {
    //     name: "Screenshots",
    //     description:
    //         "Quickly test your website for popular screen dimensions.",
    //     icon: <Icons.screenshot/>,
    //     link: "/tools/screenshots-for-dimensions",
    // },
    // {
    //     name: "Fonts",
    //     description:
    //         "Quickly detect fonts used on any website and get links on how to install or download them.",
    //     icon: <Icons.fonts />,
    //     link: "/tools/detect-fonts",
    // },
    // {
    //     name: "Summarize any URL",
    //     description: "Quickly summarize any website or URL.",
    //     icon: <Icons.summarize />,
    //     link: "/tools/summarize-any-url",
    // },
    // {
    //     name: "Grammar fixer",
    //     description: "Fix the grammar of any text in one click.",
    //     icon: <Icons.grammar />,
    //     link: "/tools/grammar-fixer",
    // },
    // {
    //     name: "Damn Good Chat",
    //     description:
    //         "A better ChatGPT alternative that supports superb ChatGPT plugins.",
    //     icon: <Icons.chat />,
    //     link: "/tools/damn-good-chat",
    // },
  ]
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <PageHeader
        heading="AI - Powered"
        subheading="A set of open-source tools to make your daily task easier and more efficient"
      />
      
      <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2">
                {tools.map((tool, idx) => (
                    <div key={idx} className="p-4">
                        <Link
                            href={tool.link}
                            className="flex flex-row gap-2 text-primary"
                        >
                            {tool.icon}
                            <div className="relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 after:ease-in-out hover:after:origin-bottom-left hover:after:scale-x-100 text-green-600">
                                {tool.name}
                            </div>
                        </Link>
                        <p className="ml-8 mt-2 text-muted-foreground">
                            {tool.description}
                        </p>
                    </div>
                ))}
            </div>
    </section>
  )
}
