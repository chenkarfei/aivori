'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, LogOut, Settings, LogIn, Globe, ChevronDown } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/components/AuthProvider';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const translations = {
  en: { login: 'Login', logout: 'Logout', admin: 'Admin', superAdmin: 'Dashboard', langName: 'English' },
  zh: { login: '登录', logout: '登出', admin: '管理', superAdmin: '仪表板', langName: '中文' },
  ms: { login: 'Log Masuk', logout: 'Log Keluar', admin: 'Admin', superAdmin: 'Papan Pemuka', langName: 'Melayu' }
};

export default function Navbar() {
  const { language, setLanguage, cart, setIsCartOpen } = useStore();
  const { user, role } = useAuth();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const router = useRouter();
  const t = translations[language];

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 foodie-glass w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between relative">
        {/* Left Section (Logo) */}
        <div className="flex-1 flex items-center h-full">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity h-full">
            <Image 
              src="https://i.imghippo.com/files/igKd6266Uz.png" 
              alt="Aivori Logo" 
              width={180} 
              height={60} 
              className="object-contain h-17 w-auto my-auto"
              referrerPolicy="no-referrer"
            />
          </Link>
        </div>

        {/* Right Section (Actions) */}
        <div className="flex-1 flex items-center justify-end gap-2 sm:gap-4 h-full">
          {/* Custom Language Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/40 border border-[var(--color-theme-brown)]/5 hover:bg-white/60 transition-all text-[var(--color-theme-brown)]"
            >
              <Globe size={16} className="text-[var(--color-theme-green)]" />
              <span className="text-xs font-bold uppercase tracking-wider">{language}</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isLangOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsLangOpen(false)}></div>
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-40 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-[var(--color-theme-brown)]/5 p-2 z-20 overflow-hidden"
                  >
                    {(['en', 'zh', 'ms'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang);
                          setIsLangOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                          language === lang 
                            ? 'bg-[var(--color-theme-orange)] text-white' 
                            : 'hover:bg-[var(--color-theme-brown)]/5 text-[var(--color-theme-brown)]'
                        }`}
                      >
                        {translations[lang].langName}
                        {language === lang && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Admin Links */}
          {(role === 'admin' || role === 'super_admin') && (
            <Link href="/admin" className="font-bold text-[var(--color-theme-brown)] hover:text-[var(--color-theme-orange)] flex items-center gap-2 px-2 py-2 rounded-xl transition-colors text-sm">
              <Settings size={18} className="text-[var(--color-theme-green)]" /> <span className="hidden lg:inline">{t.admin}</span>
            </Link>
          )}
          {role === 'super_admin' && (
            <Link href="/super-admin" className="font-bold text-[var(--color-theme-brown)] hover:text-[var(--color-theme-orange)] flex items-center gap-2 px-2 py-2 rounded-xl transition-colors text-sm">
              <Settings size={18} className="text-[var(--color-theme-green)]" /> <span className="hidden lg:inline">{t.superAdmin}</span>
            </Link>
          )}

          {/* Cart Button */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-[var(--color-theme-brown)] hover:text-[var(--color-theme-orange)] transition-colors"
          >
            <ShoppingCart size={22} className="text-[var(--color-theme-green)]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[var(--color-theme-orange)] text-white text-[9px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full shadow-sm">
                {cartCount}
              </span>
            )}
          </button>

          {/* Auth Button */}
          {user ? (
            <button onClick={handleLogout} className="flex items-center gap-2 font-bold text-[var(--color-theme-brown)] hover:text-[var(--color-theme-orange)] px-2 py-2 rounded-xl transition-colors text-sm">
              <LogOut size={18} className="text-[var(--color-theme-green)]" /> <span className="hidden sm:inline">{t.logout}</span>
            </button>
          ) : (
            <Link href="/login" className="foodie-button px-4 py-2 text-xs flex items-center gap-1.5">
              <LogIn size={16} className="text-white" /> <span className="hidden sm:inline">{t.login}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
