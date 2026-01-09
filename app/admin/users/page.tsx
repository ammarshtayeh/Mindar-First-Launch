"use client"

import { UsersTable } from "@/components/admin/UsersTable"
import { Users } from "lucide-react"

export default function UsersPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                   <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 flex items-center gap-3">
                        <Users className="w-8 h-8 text-indigo-400" />
                        User Management
                   </h2>
                   <p className="text-slate-400 mt-1">Manage system access and permissions</p>
                </div>
            </div>
            
            <UsersTable />
        </div>
    )
}
