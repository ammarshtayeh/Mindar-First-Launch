"use client";

import React from "react";
import { Linkedin, Instagram, Phone, Mail, Globe } from "lucide-react";
import { motion } from "framer-motion";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 pt-12 pb-6 px-6 sm:px-12 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        {/* Brand Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-orbitron font-bold text-xl shadow-lg shadow-indigo-500/20">
              M
            </div>
            <span className="text-2xl font-orbitron font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              MINDAR
            </span>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-cairo">
            حوّل ملفاتك ومحاضراتك إلى اختبارات ذكية وبطاقات استذكار في ثوانٍ معدودة باستخدام الذكاء الاصطناعي.
          </p>
        </div>

        {/* Quick Links / Services */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white font-cairo">روابط سريعة</h3>
          <ul className="space-y-3 font-cairo text-zinc-600 dark:text-zinc-400">
            <li>
              <a href="/hub" className="hover:text-indigo-600 transition-colors">منصة الملفات</a>
            </li>
            <li>
              <a href="/todo" className="hover:text-indigo-600 transition-colors">جدول المذاكرة</a>
            </li>
            <li>
              <a href="/about" className="hover:text-indigo-600 transition-colors">حول المشروع</a>
            </li>
          </ul>
        </div>

        {/* Contact info */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white font-cairo">تواصل معنا</h3>
          <div className="flex flex-col gap-3">
            <a
              href="https://www.linkedin.com/in/ammar-shtayeh-174259221/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                <Linkedin size={16} />
              </div>
              <span>Linkedin</span>
            </a>
            <a
              href="https://www.instagram.com/mindar._tech/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 text-zinc-600 dark:text-zinc-400 hover:text-pink-500 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-pink-50 dark:group-hover:bg-pink-900/30 transition-colors">
                <Instagram size={16} />
              </div>
              <span>Instagram</span>
            </a>
            <a
              href="tel:9720595537190"
              className="group flex items-center gap-3 text-zinc-600 dark:text-zinc-400 hover:text-green-500 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-green-50 dark:group-hover:bg-green-900/30 transition-colors">
                <Phone size={16} />
              </div>
              <span dir="ltr">+972 595 537 190</span>
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-zinc-500 dark:text-zinc-500 text-sm font-cairo">
        <p>© {currentYear} MINDAR. جميع الحقوق محفوظة لـ عمار اشتية.</p>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-indigo-500 transition-colors">سياسة الخصوصية</a>
          <a href="#" className="hover:text-indigo-500 transition-colors">شروط الاستخدام</a>
        </div>
      </div>
    </footer>
  );
};
