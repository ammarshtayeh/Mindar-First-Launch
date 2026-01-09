"use client"

import { motion } from "framer-motion"
import { Users, FileText, Activity, Server, Zap } from "lucide-react"

export default function AdminDashboardPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">System Overview</h2>
                    <p className="text-slate-400 mt-1">Real-time monitoring and analytics</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-mono text-emerald-400">SYSTEM ONLINE</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Users", value: "2,543", icon: Users, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
                    { label: "Active Quizzes", value: "128", icon: FileText, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
                    { label: "System Load", value: "34%", icon: Server, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
                    { label: "Real-time Visitors", value: "48", icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-6 rounded-2xl border ${stat.border} ${stat.bg} backdrop-blur-sm relative overflow-hidden group`}
                    >
                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                                <h3 className="text-3xl font-bold text-slate-100 mt-2 tracking-tight">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-xl bg-slate-950/30 ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                        {/* Glow Effect */}
                        <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-20 ${stat.color.replace('text-', 'bg-')}`} />
                    </motion.div>
                ))}
            </div>

            {/* Charts Section Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div 
                    className="lg:col-span-2 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 min-h-[400px] flex flex-col"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-indigo-400" />
                            Growth Analytics
                        </h3>
                        <select className="bg-slate-950 border border-slate-800 text-slate-400 text-xs rounded-lg px-3 py-1 outline-none focus:border-indigo-500/50">
                            <option>Last 7 days</option>
                            <option>Last 30 days</option>
                            <option>Last Quarter</option>
                        </select>
                    </div>
                    <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-950/20">
                        <p className="text-slate-500 text-sm">Chart Configuration Pending...</p>
                    </div>
                </motion.div>

                <motion.div 
                    className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 min-h-[400px]"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                >
                     <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400" />
                        Recent Activities
                    </h3>
                    <div className="space-y-4">
                        {[1,2,3,4,5].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors cursor-default border border-transparent hover:border-slate-800">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                                    U{i}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-slate-300">New quiz created</p>
                                    <p className="text-[10px] text-slate-500">2 mins ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
