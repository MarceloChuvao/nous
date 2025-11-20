import { Sidebar } from "@/components/layout/sidebar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="bg-gray-50 dark:bg-zinc-900">
            <Sidebar />
            <main style={{ marginLeft: 240, minHeight: '100vh', overflowY: 'auto' }}>
                <div className="mx-auto max-w-7xl p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
