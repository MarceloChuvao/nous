'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function DesignSystemPage() {
    return (
        <div className="space-y-12">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Design System</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Visual style guide and component library
                </p>
            </div>

            {/* Colors */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Colors</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <div className="h-24 rounded-lg bg-primary-500"></div>
                        <p className="text-sm font-medium">Primary</p>
                        <p className="text-xs text-gray-500 font-mono">primary-500</p>
                    </div>
                    <div className="space-y-2">
                        <div className="h-24 rounded-lg bg-secondary-500"></div>
                        <p className="text-sm font-medium">Secondary</p>
                        <p className="text-xs text-gray-500 font-mono">secondary-500</p>
                    </div>
                    <div className="space-y-2">
                        <div className="h-24 rounded-lg bg-gray-900 dark:bg-white"></div>
                        <p className="text-sm font-medium">Text</p>
                        <p className="text-xs text-gray-500 font-mono">gray-900</p>
                    </div>
                    <div className="space-y-2">
                        <div className="h-24 rounded-lg bg-gray-100 dark:bg-gray-800"></div>
                        <p className="text-sm font-medium">Background</p>
                        <p className="text-xs text-gray-500 font-mono">gray-100</p>
                    </div>
                </div>
            </section>

            {/* Typography */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Typography</h2>
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-4">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Heading 1</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-mono text-xs">text-4xl font-extrabold tracking-tight lg:text-5xl</p>
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-3xl font-semibold tracking-tight">Heading 2</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-mono text-xs">text-3xl font-semibold tracking-tight</p>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-semibold tracking-tight">Heading 3</h3>
                        <p className="text-gray-500 dark:text-gray-400 font-mono text-xs">text-2xl font-semibold tracking-tight</p>
                    </div>
                    <div className="space-y-1">
                        <p className="leading-7">
                            The quick brown fox jumps over the lazy dog. This is the standard body text.
                            It should be legible, with good contrast against the background.
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 font-mono text-xs">leading-7</p>
                    </div>
                </div>
            </section>

            {/* Buttons */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Buttons</h2>
                <div className="flex flex-wrap gap-4">
                    <Button>Primary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button disabled>Disabled</Button>
                </div>
            </section>

            {/* Cards */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Cards</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-semibold">Card Title</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                This is a card component with header and content sections.
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-semibold">Another Card</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Cards can be used to group related content together.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Spacing */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Spacing Scale</h2>
                <div className="space-y-2">
                    {[1, 2, 4, 6, 8, 12, 16, 24].map((size) => (
                        <div key={size} className="flex items-center gap-4">
                            <div className="w-20 text-sm font-mono text-gray-600 dark:text-gray-400">{size * 4}px</div>
                            <div className={`h-8 bg-primary-500 rounded`} style={{ width: `${size * 4}px` }}></div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
