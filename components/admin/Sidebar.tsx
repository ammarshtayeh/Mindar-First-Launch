"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, FileText, Settings, LogOut, ShieldCheck, Megaphone } from "lucide-react"
import { motion } from "framer-motion"

const sidebarItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/admin" },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: FileText, label: "Quizzes", href: "/admin/quizzes" },
    { icon: Megaphone, label: "Ads", href: "/admin/ads" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
]

export function AdminSidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-64 h-screen sticky top-0 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800/50 flex flex-col hidden md:flex">
             {/* Logo Area */}
            <div className="p-6 flex items-center gap-3 border-b border-slate-800/50 bg-slate-900/20">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.2)]">
                   <ShieldCheck className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                    <h1 className="font-bold text-lg tracking-tight text-slate-100">Admin Panel</h1>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Mindar System</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon
                    
                    return (
                        <Link 
                            key={item.href} 
                            href={item.href}
                            className={cn(
                                "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                                isActive 
                                    ? "bg-indigo-600/10 text-indigo-400" 
                                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-sidebar"
                                    className="absolute inset-0 border border-indigo-500/30 rounded-xl shadow-[0_0_10px_rgba(79,70,229,0.1)]"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-indigo-400" : "group-hover:text-indigo-300")} />
                            <span className="font-medium text-sm">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Footer / User */}
            <div className="p-4 border-t border-slate-800/50 bg-slate-900/20">
                <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 transition-colors group">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-sm">Exit Dashboard</span>
                </button>
            </div>
        </aside>
    )
}
