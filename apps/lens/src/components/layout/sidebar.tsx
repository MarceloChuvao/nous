"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    Home,
    LayoutGrid,
    MessageSquare,
    Settings,
    ChevronLeft,
    Menu,
    LogOut,
    Bot,
    Clock,
    FileText,
    Database
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/auth"
import { useRouter } from "next/navigation"

const navigation = [
    { name: "Dashboard", href: "/home", icon: Home },
    { name: "Domains", href: "/domains", icon: LayoutGrid },
    { name: "My Agents", href: "/agents", icon: Bot },
    { name: "Tasks", href: "/tasks", icon: Clock },
    { name: "Logs", href: "/logs", icon: FileText },
    { name: "Context", href: "/context", icon: Database },
    { name: "Chat", href: "/chat", icon: MessageSquare },
    { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
    const [isCollapsed, setIsCollapsed] = React.useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const logout = useAuthStore(state => state.logout)

    const handleLogout = () => {
        logout()
        router.push('/login')
    }

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: isCollapsed ? 80 : 240,
                transition: 'width 300ms ease-in-out',
                borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(12px)',
                zIndex: 40
            }}
        >
            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                style={{
                    position: 'absolute',
                    right: '-12px',
                    top: '24px',
                    display: 'flex',
                    height: '24px',
                    width: '24px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '9999px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                    zIndex: 10
                }}
            >
                <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
            </button>

            {/* Logo */}
            <div style={{ display: 'flex', height: '64px', alignItems: 'center', padding: '0 24px', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        display: 'flex',
                        height: '32px',
                        width: '32px',
                        flexShrink: 0,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px',
                        background: 'linear-gradient(to bottom right, #0ea5e9, #a855f7)'
                    }}>
                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>N</span>
                    </div>
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-400"
                            >
                                NOUS
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Navigation */}
            <div style={{
                flex: '1 1 0%',
                minHeight: 0,
                overflowY: 'auto',
                padding: '16px 12px'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-primary-500/10",
                                    isActive
                                        ? "bg-primary-500/10 text-primary-600 dark:text-primary-400"
                                        : "text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                                )}
                                style={{ position: 'relative' }}
                            >
                                <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary-600 dark:text-primary-400")} />
                                <AnimatePresence>
                                    {!isCollapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className="ml-3 whitespace-nowrap"
                                        >
                                            {item.name}
                                        </motion.span>
                                    )}
                                </AnimatePresence>

                                {/* Active Indicator */}
                                {isActive && (
                                    <motion.div
                                        layoutId="active-nav"
                                        className="absolute left-0 h-8 w-1 rounded-r-full bg-primary-600 dark:bg-primary-400"
                                        style={{ position: 'absolute' }}
                                    />
                                )}
                            </Link>
                        )
                    })}

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className={cn(
                            "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-red-500/10 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400",
                            isCollapsed && "justify-center"
                        )}
                        style={{ marginTop: '8px', width: '100%' }}
                    >
                        <LogOut className="h-5 w-5 shrink-0" />
                        <AnimatePresence>
                            {!isCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="ml-3 whitespace-nowrap"
                                >
                                    Logout
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
            </div>
        </div>
    )
}
