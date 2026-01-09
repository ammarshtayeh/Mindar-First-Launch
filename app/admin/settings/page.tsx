"use client"

import { Settings, Save } from "lucide-react"

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-200 to-slate-400 flex items-center gap-3">
                <Settings className="w-8 h-8 text-slate-400" />
                System Configuration
            </h2>
            
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-8 max-w-2xl">
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-200 border-b border-slate-800 pb-2">General Settings</h3>
                    <div className="grid gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-400">System Name</label>
                            <input type="text" disabled value="Mindar Admin" className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-400 cursor-not-allowed" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-400">Maintenance Mode</label>
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-11 bg-slate-800 rounded-full relative cursor-pointer">
                                    <div className="absolute left-1 top-1 h-4 w-4 bg-slate-500 rounded-full" />
                                </div>
                                <span className="text-sm text-slate-500">Disabled</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-800/50">
                    <button className="flex items-center gap-2 bg-indigo-600/10 text-indigo-400 px-4 py-2 rounded-lg border border-indigo-500/20 hover:bg-indigo-600/20 transition-colors">
                        <Save className="w-4 h-4" />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    )
}
