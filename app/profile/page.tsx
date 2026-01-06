"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { changePassword } from "@/lib/services/authService";
import { motion } from "framer-motion";
import { User as UserIcon, Lock, Mail, Save, AlertCircle, CheckCircle2, Loader2, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError(t('common.passwordMismatch') || "Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError(t('common.passwordTooShort') || "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await changePassword(newPassword);
      setSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-6"
        >
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-[2rem] bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white shadow-2xl shadow-primary/20">
            <UserIcon className="w-10 h-10 md:w-12 md:h-12" />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              {t('profile.title')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium md:text-lg">
              {user.displayName || user.email?.split('@')[0]}
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Info Card */}
          <Card className="lg:col-span-1 border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="pt-8 px-8">
              <CardTitle className="text-xl font-black">{t('profile.personalInfo')}</CardTitle>
              <CardDescription>{t('profile.personalInfoDesc') || 'Manage your personal details'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider text-slate-400">{t('profile.displayName')}</label>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold">
                  <UserIcon className="w-5 h-5 text-primary" />
                  <span>{user.displayName || '---'}</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider text-slate-400">{t('profile.email')}</label>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold">
                  <Mail className="w-5 h-5 text-primary" />
                  <span>{user.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card className="lg:col-span-2 border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="pt-8 px-8">
              <CardTitle className="text-2xl font-black flex items-center gap-3">
                <Key className="w-6 h-6 text-primary" />
                {t('profile.changePassword')}
              </CardTitle>
              <CardDescription>{t('profile.changePasswordDesc') || 'Update your password to keep your account secure'}</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 dark:text-slate-300 ml-1">{t('profile.newPassword')}</label>
                    <div className="relative">
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pr-12 h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-primary focus:border-primary transition-all font-medium"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 dark:text-slate-300 ml-1">{t('profile.confirmNewPassword')}</label>
                    <div className="relative">
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pr-12 h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-primary focus:border-primary transition-all font-medium"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-bold"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 flex items-center gap-3 text-green-600 dark:text-green-400 text-sm font-bold"
                  >
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <p>{t('auth.passwordChanged')}</p>
                  </motion.div>
                )}

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-14 px-8 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {t('profile.updateBtn')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
