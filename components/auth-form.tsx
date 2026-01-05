"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, LogIn, UserPlus, AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { signUp, login, signInWithGoogle } from "@/lib/services/authService";
import { cn } from "@/lib/utils";

interface AuthFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        // Validation for Signup
        if (password !== confirmPassword) {
          setError("كلمات المرور غير متطابقة!");
          setLoading(false);
          return;
        }
        if (!firstName || !lastName) {
          setError("يرجى إدخال الاسم الأول واسم العائلة.");
          setLoading(false);
          return;
        }

        await signUp(email, password, firstName, lastName);
        setSuccess(true);
      }
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "حدث خطأ ما، يرجى المحاولة لاحقاً.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // Note: We don't set loading immediately to avoid interfering with the popup trigger
    setError(null);
    try {
      await signInWithGoogle();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      if (err.message && err.message.includes('popup-blocked')) {
        setError("المتصفح منع النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة لهذا الموقع.");
      } else {
        setError(err.message || "حدث خطأ أثناء تسجيل الدخول عبر جوجل.");
      }
    } finally {
      // We can set loading false here, although we never set it true. 
      // If we want loading state, we should handle it carefully, but priority is popup working.
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative w-full max-w-md"
    >
      <Card className="border-slate-200 dark:border-slate-800 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        )}

        <CardHeader className="space-y-1 pt-8 pb-4 text-center">
          <div className="mx-auto w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-red-500/20">
            {isLogin ? <LogIn className="w-8 h-8 text-white" /> : <UserPlus className="w-8 h-8 text-white" />}
          </div>
          <CardTitle className="text-3xl font-black text-slate-900 dark:text-white">
            {isLogin ? "تسجيل الدخول" : "إنشاء حساب جديد"}
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            {isLogin ? "مرحباً بعودتك إلى مندار!" : "انضم إلى عائلة مندار اليوم!"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Input
                    placeholder="الاسم الأول"
                    value={firstName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                    className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-red-500 focus:border-red-500 transition-all font-medium"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    placeholder="اسم العائلة"
                    value={lastName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
                    className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-red-500 focus:border-red-500 transition-all font-medium"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  className="pr-12 h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-red-500 focus:border-red-500 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="password"
                  placeholder="كلمة المرور"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  className="pr-12 h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-red-500 focus:border-red-500 transition-all font-medium"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="password"
                    placeholder="تأكيد كلمة المرور"
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                    className="pr-12 h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-red-500 focus:border-red-500 transition-all font-medium"
                    required
                  />
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm font-bold"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 rounded-2xl bg-green-50 border border-green-100 flex items-center gap-3 text-green-600 text-sm font-bold"
                >
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <p>تم إنشاء الحساب بنجاح!</p>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-lg font-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-900/10 dark:shadow-white/10"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : isLogin ? (
                "دخول"
              ) : (
                "إنشاء حساب"
              )}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-900 text-slate-500 font-bold uppercase tracking-wider">
                  أو
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={handleGoogleSignIn}
              className="w-full h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white text-lg font-black hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
              <span>متابعة باستخدام جوجل</span>
            </Button>
          </form>
        </CardContent>

        <CardFooter className="pb-8 flex flex-col gap-4">
          <div className="text-center w-full">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-slate-600 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 font-bold transition-colors"
            >
              {isLogin ? "ليس لديك حساب؟ سجل الآن" : "لديك حساب بالفعل؟ سجل دخولك"}
            </button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
