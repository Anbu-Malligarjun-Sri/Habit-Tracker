import PlaceholderPage from "@/shared/components/feedback/placeholder-page"
import { Book } from "lucide-react"

export default function JournalPage() {
    return (
        <PlaceholderPage
            title="Daily Journal"
            description="Reflect on your day, track your mood, and capture ideas with markdown support."
            icon={Book}
        />
    )
}
