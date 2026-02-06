import PlaceholderPage from "@/shared/components/feedback/placeholder-page"
import { DollarSign } from "lucide-react"

export default function FinancePage() {
    return (
        <PlaceholderPage
            title="Finance Tracker"
            description="Track expenses, visualize spending trends, and manage your budget with intelligent categorization."
            icon={DollarSign}
        />
    )
}
