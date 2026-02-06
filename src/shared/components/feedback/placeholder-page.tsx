import { LucideIcon } from "lucide-react"

interface PlaceholderPageProps {
    title: string
    description: string
    icon?: LucideIcon
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center bg-muted/10 rounded-xl border border-dashed m-4 h-[600px]">
            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
            <p className="text-xl text-muted-foreground max-w-[600px]">
                {description}
            </p>
            <div className="text-sm bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-4 py-2 rounded-full border border-yellow-500/20">
                Feature Coming Soon ✨
            </div>
        </div>
    )
}
