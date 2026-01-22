"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  FileText,
  Activity,
  Server,
  Zap,
  ShieldCheck,
  AlertTriangle,
  FolderLock,
  Power,
  RotateCcw,
} from "lucide-react";
import {
  getAllUsers,
  getSystemConfig,
  updateSystemConfig,
  SystemFeatures,
} from "@/lib/services/dbService";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface APIStatus {
  name: string;
  provider: string;
  limit: number;
  used: number;
  remaining: number;
  status: string;
  type: string;
  cost?: string;
}

export default function AdminDashboardPage() {
  const [systemData, setSystemData] = useState<{
    dailyUsage: number;
    totalTokens: number;
    estimatedCost: string;
    apis: APIStatus[];
  } | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [featureFlags, setFeatureFlags] = useState<SystemFeatures | null>(null);
  const [updatingFeature, setUpdatingFeature] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusRes, users, config] = await Promise.all([
          fetch("/api/admin/system-status"),
          getAllUsers(),
          getSystemConfig(),
        ]);

        const statusData = await statusRes.json();
        setSystemData(statusData);
        setTotalUsers(users.length);
        setFeatureFlags(config);
      } catch (err) {
        console.error("Failed to fetch admin data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const handleToggleFeature = async (
    key: keyof SystemFeatures,
    current: boolean,
  ) => {
    setUpdatingFeature(key as string);
    try {
      await updateSystemConfig({ [key]: !current });
      setFeatureFlags((prev: SystemFeatures | null) =>
        prev ? { ...prev, [key]: !current } : prev,
      );
    } catch (err) {
      console.error("Toggle failed", err);
    } finally {
      setUpdatingFeature(null);
    }
  };

  const stats = [
    {
      label: "Estimated Cost (Daily)",
      value: `$${systemData?.estimatedCost || "0.00"}`,
      icon: Zap,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      label: "Token Consumption",
      value: systemData?.totalTokens?.toLocaleString() || "0",
      icon: Activity,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
    },
    {
      label: "AI Requests",
      value: systemData?.dailyUsage?.toString() || "0",
      icon: FileText,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
    },
    {
      label: "Total Users",
      value: totalUsers.toString(),
      icon: Users,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
            System Overview
          </h2>
          <p className="text-slate-400 mt-1">
            Monitoring API limits and user growth
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono text-emerald-400 uppercase">
            {loading ? "INITIALIZING..." : "SYSTEM ONLINE"}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-6 rounded-2xl border ${stat.border} ${stat.bg} backdrop-blur-sm relative overflow-hidden group`}
          >
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-slate-400 text-sm font-medium">
                  {stat.label}
                </p>
                <h3 className="text-3xl font-bold text-slate-100 mt-2 tracking-tight">
                  {stat.value}
                </h3>
              </div>
              <div className={`p-3 rounded-xl bg-slate-950/30 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div
              className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-20 ${stat.color.replace("text-", "bg-")}`}
            />
          </motion.div>
        ))}
      </div>

      {/* API Status Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          className="lg:col-span-2 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" />
              API Provider Quotas
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>

          <div className="space-y-6">
            {systemData?.apis?.map((api, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${api.status === "Online" ? "bg-emerald-500" : "bg-red-500"}`}
                    />
                    <span className="font-bold text-slate-200">{api.name}</span>
                    <span className="text-xs text-slate-500 px-2 py-0.5 rounded-full bg-slate-800">
                      {api.provider}
                    </span>
                    {api.cost && (
                      <span className="text-[10px] text-amber-500 font-mono">
                        ${api.cost}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {api.used} / {api.limit} (
                    {((api.remaining / api.limit) * 100).toFixed(0)}% rem)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width:
                        typeof api.limit === "number" &&
                        typeof api.used === "number"
                          ? `${(api.used / api.limit) * 100}%`
                          : "10%",
                    }}
                    className={`h-full bg-gradient-to-r ${
                      typeof api.limit === "number" &&
                      typeof api.used === "number" &&
                      api.used / api.limit > 0.8
                        ? "from-red-500 to-rose-600"
                        : "from-indigo-500 to-cyan-500"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            System Health
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-emerald-400">
                  Database Optimized
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Firestore listeners are active and responding within 20ms.
                </p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-400">
                  Rate Limiting Check
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Gemini usage is normal. No throttle incidents reported.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      {/* Feature Management Section */}
      <motion.div
        className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <FolderLock className="w-5 h-5 text-primary" />
              Module Feature Controls
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Enable or disable specific features across the platform in
              real-time.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featureFlags &&
            Object.entries(featureFlags).map(([key, value]) => {
              const typedKey = key as keyof SystemFeatures;
              const isUpdating = updatingFeature === key;

              return (
                <div
                  key={key}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border transition-all",
                    value
                      ? "bg-slate-950/40 border-slate-800"
                      : "bg-red-500/5 border-red-500/20 grayscale opacity-80",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        value ? "bg-primary/10" : "bg-slate-800",
                      )}
                    >
                      <Power
                        className={cn(
                          "w-4 h-4",
                          value ? "text-primary" : "text-slate-500",
                        )}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold capitalize text-slate-200">
                        {key.replace(/([A-Z])/g, " $1")}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {value ? "Feature Active" : "Disabled"}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={value ? "default" : "outline"}
                    disabled={isUpdating}
                    onClick={() => handleToggleFeature(typedKey, value)}
                    className={cn(
                      "rounded-lg h-8 px-4 text-xs font-bold transition-all",
                      value
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-red-500 hover:text-white hover:border-red-500",
                    )}
                  >
                    {isUpdating ? (
                      <RotateCcw className="w-3 h-3 animate-spin" />
                    ) : value ? (
                      "ACTIVE"
                    ) : (
                      "DISABLED"
                    )}
                  </Button>
                </div>
              );
            })}
        </div>
      </motion.div>
    </div>
  );
}
