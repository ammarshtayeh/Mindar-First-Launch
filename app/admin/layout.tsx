"use client"

import { ReactNode } from "react"
import { AdminSidebar } from "@/components/admin/Sidebar"
import { motion } from "framer-motion"
import { useAdmin } from "@/hooks/use-admin"

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { loading, isAdmin } = useAdmin()

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Recallibrating Neuro-Link...</div>
  
  if (!isAdmin) return null

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto h-screen p-6 md:p-8 lg:p-10 transition-all duration-300">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto"
            >
                {children}
            </motion.div>
        </main>
    </div>
  )
}
